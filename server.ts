import 'dotenv/config';
import express from 'express';
import { createServer as createHttpServer } from 'node:http';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import {
  addMentorMessage,
  clearMentorMessages,
  createUser,
  deleteAnalysis,
  findUserByEmail,
  findUserById,
  getAnalysisById,
  listAnalysesByUser,
  listMentorMessages,
  saveAnalysis,
  toggleRoadmapDay,
  updateAnalysisResult,
  updateUserProfile,
} from './server/db.ts';
import {
  runFullSkillXRayPipeline,
  runLearningMentorAgent,
  runMentorChatAgent,
} from './server/agents.ts';

const PORT = 3000;
const SESSION_COOKIE = 'sxr_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(process.cwd() + '_skillxray_dev_secret').digest('hex');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function signUserId(userId: number): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, iat: Date.now() })).toString(
    'base64url'
  );
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): number | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!sig || sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: number;
    };
    return typeof parsed.uid === 'number' ? parsed.uid : null;
  } catch {
    return null;
  }
}

function setSessionCookie(res: express.Response, userId: number) {
  const token = signUserId(userId);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function getAuthenticatedUserId(req: express.Request): number | null {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  return verifySessionToken(token);
}

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const user = findUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Session expired' });
    return;
  }
  (req as express.Request & { userId: number }).userId = userId;
  next();
}

// =========================================================
// HEALTH & SYSTEM STATUS
// =========================================================
app.get('/api/health', (_req, res) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  const geminiConfigured = Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.length >= 12);
  res.json({ status: 'ok', geminiConfigured });
});

// =========================================================
// AUTHENTICATION ROUTES
// =========================================================
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, roleTitle, targetRole } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    roleTitle?: string;
    targetRole?: string;
  };

  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createUser(
    name,
    email,
    passwordHash,
    roleTitle || 'Software Builder',
    targetRole || 'AI Product Engineer'
  );
  setSessionCookie(res, user.id);
  res.status(201).json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const record = findUserByEmail(email);
  if (!record || !bcrypt.compareSync(password, record.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  setSessionCookie(res, record.id);
  const user = findUserById(record.id);
  res.json({ user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.json({ user: null });
    return;
  }
  const user = findUserById(userId) ?? null;
  res.json({ user });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const { name, roleTitle, targetRole, bio } = req.body as {
    name?: string;
    roleTitle?: string;
    targetRole?: string;
    bio?: string;
  };
  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters.' });
    return;
  }
  const updated = updateUserProfile(userId, {
    name,
    roleTitle: roleTitle || '',
    targetRole: targetRole || '',
    bio: bio || '',
  });
  res.json({ user: updated });
});

// =========================================================
// PDF EXTRACTION & 5-AGENT SKILL X-RAY ROUTES
// =========================================================
app.post('/api/analyze/extract-pdf', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please upload a PDF file.' });
    return;
  }
  if (
    req.file.mimetype !== 'application/pdf' &&
    !req.file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    res.status(400).json({ error: 'Only PDF files are supported.' });
    return;
  }

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: req.file.buffer });
    const parsed = await parser.getText();
    const text = (parsed.text || '').trim();
    if (!text) {
      res.status(422).json({
        error: 'No readable text found inside this PDF. Please paste your resume text instead.',
      });
      return;
    }
    res.json({
      filename: req.file.originalname,
      pages: parsed.total ?? parsed.pages?.length ?? 1,
      text,
    });
  } catch (err) {
    console.error('[PDF Extraction Error]', err);
    res.status(422).json({
      error: 'Unable to parse this PDF file. Please verify it is a valid text-based PDF.',
    });
  } finally {
    if (parser) {
      await parser.destroy().catch(() => undefined);
    }
  }
});

app.post('/api/analyze/run', requireAuth, async (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const { resumeText, projectDescriptions, targetRole, title, resumeFilename } = req.body as {
    resumeText?: string;
    projectDescriptions?: string;
    targetRole?: string;
    title?: string;
    resumeFilename?: string | null;
  };

  const cleanResume = (resumeText || '').trim();
  const cleanProjects = (projectDescriptions || '').trim();

  if (cleanResume.length < 20 && cleanProjects.length < 20) {
    res.status(400).json({
      error: 'Provide at least 20 characters in your resume text or project descriptions.',
    });
    return;
  }

  try {
    const resolvedTarget = (targetRole || '').trim();
    const { payload, overallMode } = await runFullSkillXRayPipeline({
      resumeText: cleanResume,
      projectDescriptions: cleanProjects,
      targetRole: resolvedTarget,
    });

    const resolvedTitle =
      (title || '').trim() ||
      `${payload.careerMatching.topCareers[0]?.title || resolvedTarget || 'Skill'} X-Ray`;

    const saved = saveAnalysis({
      userId,
      title: resolvedTitle,
      resumeFilename: resumeFilename || null,
      targetRole: resolvedTarget || payload.careerMatching.topCareers[0]?.title || 'AI Engineer',
      rawText: cleanResume,
      projectDescriptions: cleanProjects,
      result: payload,
      modeUsed: overallMode,
    });

    res.status(201).json({ analysis: saved });
  } catch (err) {
    console.error('[Pipeline Error]', err);
    res.status(500).json({ error: 'Skill X-Ray analysis failed. Please try again.' });
  }
});

app.get('/api/analyses', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const analyses = listAnalysesByUser(userId);
  res.json({ analyses });
});

app.get('/api/analyses/:id', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const id = Number(req.params.id);
  const analysis = getAnalysisById(id, userId);
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }
  res.json({ analysis });
});

app.delete('/api/analyses/:id', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const id = Number(req.params.id);
  const deleted = deleteAnalysis(id, userId);
  if (!deleted) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }
  res.json({ ok: true });
});

app.post('/api/roadmap/toggle', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const { analysisId, dayNumber } = req.body as { analysisId?: number; dayNumber?: number };
  if (!analysisId || !dayNumber || dayNumber < 1 || dayNumber > 30) {
    res.status(400).json({ error: 'Invalid analysisId or dayNumber (1-30).' });
    return;
  }
  const analysis = getAnalysisById(analysisId, userId);
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }
  const completedDays = toggleRoadmapDay(userId, analysisId, dayNumber);
  res.json({ completedDays });
});

app.post('/api/roadmap/regenerate', requireAuth, async (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const { analysisId, targetCareer } = req.body as {
    analysisId?: number;
    targetCareer?: string;
  };
  if (!analysisId || !targetCareer?.trim()) {
    res.status(400).json({ error: 'analysisId and targetCareer are required.' });
    return;
  }
  const analysis = getAnalysisById(analysisId, userId);
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }

  const missing = analysis.result.skillGap.skills
    .filter((s) => s.bucket === 'missing')
    .map((s) => s.name);
  const developing = analysis.result.skillGap.skills
    .filter((s) => s.bucket === 'developing')
    .map((s) => s.name);

  const { data: newRoadmap } = await runLearningMentorAgent(
    targetCareer.trim(),
    missing,
    developing
  );

  const updatedPayload = {
    ...analysis.result,
    learningRoadmap: newRoadmap,
  };
  updateAnalysisResult(analysisId, userId, updatedPayload);
  const refreshed = getAnalysisById(analysisId, userId);
  res.json({ analysis: refreshed });
});

// =========================================================
// AI MENTOR CHAT ROUTES
// =========================================================
app.get('/api/mentor/messages', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const messages = listMentorMessages(userId);
  res.json({ messages });
});

app.post('/api/mentor/chat', requireAuth, async (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  const { message } = req.body as { message?: string };
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  const userMsg = addMentorMessage(userId, 'user', message.trim());
  const analyses = listAnalysesByUser(userId);
  const history = listMentorMessages(userId).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const { reply, mode } = await runMentorChatAgent(message.trim(), analyses[0], history);
  const assistantMsg = addMentorMessage(userId, 'assistant', reply);

  res.json({ userMessage: userMsg, assistantMessage: assistantMsg, mode });
});

app.delete('/api/mentor/messages', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: number }).userId;
  clearMentorMessages(userId);
  res.json({ ok: true });
});

// =========================================================
// VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD)
// =========================================================
async function startServer() {
  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillX-Ray AI running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
