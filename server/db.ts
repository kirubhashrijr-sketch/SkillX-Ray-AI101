import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import type {
  AnalysisRecord,
  FullSkillXRayPayload,
  MentorMessage,
  UserProfile,
} from '../src/types/skillxray.ts';

const DB_PATH = path.resolve(process.cwd(), 'skillxray.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_title TEXT NOT NULL DEFAULT 'Software Engineer',
    target_role TEXT NOT NULL DEFAULT 'AI Systems Engineer',
    bio TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    resume_filename TEXT,
    target_role TEXT NOT NULL DEFAULT '',
    raw_text TEXT NOT NULL,
    project_descriptions TEXT NOT NULL,
    result_json TEXT NOT NULL,
    mode_used TEXT NOT NULL DEFAULT 'demo',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS roadmap_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    analysis_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, analysis_id, day_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mentor_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function buildSeedAnalysis(): FullSkillXRayPayload {
  return {
    resumeAnalysis: {
      candidateName: 'Alex Rivera',
      experienceLevel: 'Mid-Level Full-Stack & Data Builder (3+ Years)',
      summary:
        'Hands-on product engineer who ships end-to-end TypeScript and Python web systems, leads cross-functional hackathon sprints, and integrates APIs with reliable error handling.',
      technicalSkills: [
        'TypeScript',
        'React',
        'Python',
        'Node.js',
        'SQLite / PostgreSQL',
        'REST APIs',
        'Tailwind CSS',
        'Docker',
      ],
      softSkills: [
        'Cross-functional Alignment',
        'Technical Documentation',
        'Rapid Prototyping',
        'Stakeholder Communication',
      ],
      toolsAndFrameworks: ['Vite', 'Express', 'Git', 'Chart.js', 'Postman', 'Linux CLI'],
      keyAchievements: [
        'Reduced API latency by 42% by introducing batched database queries and response caching.',
        'Coordinated a 4-person team to ship an accessible analytics portal in 48 hours.',
        'Automated PDF intake workflows, cutting manual review time from 20 minutes to 15 seconds.',
      ],
    },
    hiddenSkills: {
      hiddenTechnical: [
        {
          skill: 'Pipeline Orchestration & Fault Tolerance',
          category: 'Technical',
          confidence: 91,
          evidence:
            'Built automated PDF intake workflows with deterministic fallbacks when upstream parsing failed.',
          impactNote: 'Directly transfers to resilient LLM agent orchestration and ETL engineering.',
        },
        {
          skill: 'Query Performance Tuning',
          category: 'Technical',
          confidence: 88,
          evidence:
            'Reduced API latency by 42% via batched database queries and targeted caching layers.',
          impactNote: 'Demonstrates systems-level performance intuition beyond CRUD implementation.',
        },
      ],
      communication: [
        {
          skill: 'Executive Trade-off Framing',
          category: 'Communication',
          confidence: 89,
          evidence:
            'Translated latency reduction and workflow speedups into clear time-saved business metrics.',
          impactNote: 'Essential for Staff Engineer, Solutions Architect, and Product Engineering roles.',
        },
      ],
      leadership: [
        {
          skill: 'Rapid Sprint Facilitation',
          category: 'Leadership',
          confidence: 86,
          evidence:
            'Coordinated a 4-person multidisciplinary team to deliver a complete analytics portal under tight deadlines.',
          impactNote: 'Indicates readiness for Tech Lead or Founding Engineer ownership.',
        },
      ],
      problemSolving: [
        {
          skill: 'Root-Cause Bottleneck Isolation',
          category: 'Problem-Solving',
          confidence: 92,
          evidence:
            'Identified manual review bottlenecks and eliminated I/O overhead in the request lifecycle.',
          impactNote: 'Strong signal for distributed systems debugging and AI workflow design.',
        },
      ],
      synthesisNote:
        'Your project narratives reveal systems architecture instincts and team leadership that do not appear in your listed skills section.',
    },
    skillGap: {
      readinessScore: 81,
      summary:
        'Strong full-stack engineering base with high latent systems thinking. Closing gaps in LLM evaluation, vector retrieval, and cloud observability unlocks top-tier AI Engineer roles.',
      domainScores: [
        { dimension: 'Architecture', score: 82, benchmark: 85 },
        { dimension: 'Implementation', score: 90, benchmark: 85 },
        { dimension: 'AI & Data', score: 68, benchmark: 82 },
        { dimension: 'Communication', score: 86, benchmark: 78 },
        { dimension: 'Leadership', score: 81, benchmark: 75 },
        { dimension: 'Problem Solving', score: 91, benchmark: 84 },
      ],
      skills: [
        {
          name: 'TypeScript & React',
          bucket: 'strong',
          proficiency: 92,
          marketDemand: 94,
          category: 'Frontend & Core',
          rationale: 'Consistent production delivery across interactive dashboards.',
        },
        {
          name: 'API & Backend Design',
          bucket: 'strong',
          proficiency: 88,
          marketDemand: 91,
          category: 'Backend',
          rationale: 'Proven latency optimization and clean REST architecture.',
        },
        {
          name: 'SQL & Data Modeling',
          bucket: 'strong',
          proficiency: 84,
          marketDemand: 89,
          category: 'Data',
          rationale: 'Batched query design and relational schema fluency.',
        },
        {
          name: 'Pipeline Fault Tolerance',
          bucket: 'hidden',
          proficiency: 85,
          marketDemand: 87,
          category: 'Systems',
          rationale: 'Inferred from fallback design and automated ingestion workflows.',
        },
        {
          name: 'Sprint Leadership',
          bucket: 'hidden',
          proficiency: 83,
          marketDemand: 82,
          category: 'Leadership',
          rationale: 'Inferred from coordinating multi-role product delivery under deadlines.',
        },
        {
          name: 'Executive Metric Framing',
          bucket: 'hidden',
          proficiency: 86,
          marketDemand: 85,
          category: 'Communication',
          rationale: 'Inferred from quantifying engineering wins in user-time saved.',
        },
        {
          name: 'Structured LLM Agents',
          bucket: 'developing',
          proficiency: 66,
          marketDemand: 96,
          category: 'AI Engineering',
          rationale: 'API integration fluency is present; needs schema evaluation and tool-calling depth.',
        },
        {
          name: 'Containerized CI/CD',
          bucket: 'developing',
          proficiency: 62,
          marketDemand: 88,
          category: 'DevOps',
          rationale: 'Docker basics shown; needs automated multi-stage pipelines and health probes.',
        },
        {
          name: 'RAG & Vector Indexing',
          bucket: 'missing',
          proficiency: 32,
          marketDemand: 93,
          category: 'AI Engineering',
          rationale: 'High leverage addition for semantic search and grounded AI assistants.',
        },
        {
          name: 'LLM Evals & Observability',
          bucket: 'missing',
          proficiency: 28,
          marketDemand: 90,
          category: 'AI Operations',
          rationale: 'Required by senior AI teams to measure precision, drift, and latency.',
        },
      ],
    },
    careerMatching: {
      topCareers: [
        {
          title: 'AI Product Engineer',
          matchPercentage: 91,
          salaryRange: '$135k – $185k',
          demandGrowth: '+38% YoY',
          description:
            'Designs and ships end-to-end AI-powered web applications combining responsive UX, structured LLM orchestration, and reliable backend pipelines.',
          matchedSkills: [
            'TypeScript & React',
            'API & Backend Design',
            'Pipeline Fault Tolerance',
            'Executive Metric Framing',
          ],
          missingSkills: ['RAG & Vector Indexing', 'LLM Evals & Observability'],
          whyItFits:
            'Combines your 90+ implementation score with your hidden strength in fault-tolerant pipelines.',
        },
        {
          title: 'Solutions Architect (AI & Cloud)',
          matchPercentage: 86,
          salaryRange: '$145k – $195k',
          demandGrowth: '+29% YoY',
          description:
            'Translates complex business requirements into scalable multi-agent architectures, leading technical discovery and proof-of-value builds.',
          matchedSkills: [
            'Executive Metric Framing',
            'Sprint Leadership',
            'SQL & Data Modeling',
            'API & Backend Design',
          ],
          missingSkills: ['Multi-Region Cloud IAM', 'LLM Evals & Observability'],
          whyItFits:
            'Leverages your hidden communication and leadership evidence alongside full-stack fluency.',
        },
        {
          title: 'Full-Stack Staff Track Engineer',
          matchPercentage: 84,
          salaryRange: '$140k – $190k',
          demandGrowth: '+22% YoY',
          description:
            'Owns core product architecture, performance optimization, and cross-team technical standards across frontend and backend systems.',
          matchedSkills: [
            'TypeScript & React',
            'SQL & Data Modeling',
            'Root-Cause Bottleneck Isolation',
          ],
          missingSkills: ['Containerized CI/CD', 'Distributed Tracing'],
          whyItFits:
            'Your 42% latency optimization and rapid sprint facilitation align directly with senior ownership.',
        },
      ],
    },
    learningRoadmap: {
      targetCareer: 'AI Product Engineer',
      overview:
        'A 30-day targeted sprint turning your full-stack foundation and hidden systems skills into production AI Product Engineering mastery.',
      weeklyThemes: [
        'Week 1: Structured Gemini Schemas & Prompt Reliability',
        'Week 2: Embeddings, Hybrid Retrieval & Grounded Context',
        'Week 3: Automated LLM Evals, Tracing & Guardrails',
        'Week 4: Containerized Production Deployment & Capstone Launch',
      ],
      days: Array.from({ length: 30 }, (_, idx) => {
        const day = idx + 1;
        const week = Math.ceil(day / 7);
        const templates = [
          {
            title: 'JSON Schema Enforcement & Deterministic Parsing',
            focusSkill: 'Structured LLM Agents',
            dailyTask: 'Define strict TypeScript interfaces and matching responseSchema definitions for multi-step extraction.',
            practicalExercise: 'Build a resume-to-JSON extractor with fallback validation and retry backoff.',
            resourceTitle: 'Google GenAI Structured Output Guide',
            resourceUrl: 'https://ai.google.dev/gemini-api/docs/structured-output',
          },
          {
            title: 'Multi-Agent Parallel Fan-Out Architecture',
            focusSkill: 'Pipeline Fault Tolerance',
            dailyTask: 'Refactor sequential agent calls into parallel fan-out stages with typed error boundaries.',
            practicalExercise: 'Run 3 specialized analysis agents via Promise.allSettled and merge results.',
            resourceTitle: 'Building Effective Agents Patterns',
            resourceUrl: 'https://ai.google.dev/gemini-api/docs',
          },
          {
            title: 'Vector Embeddings & Semantic Similarity',
            focusSkill: 'RAG & Vector Indexing',
            dailyTask: 'Generate dense embeddings for project paragraphs and compute cosine similarity.',
            practicalExercise: 'Index 20 skill descriptions and rank top-5 matches for a job posting.',
            resourceTitle: 'Gemini Embeddings Documentation',
            resourceUrl: 'https://ai.google.dev/gemini-api/docs/embeddings',
          },
          {
            title: 'Automated Golden-Set Evaluation Harness',
            focusSkill: 'LLM Evals & Observability',
            dailyTask: 'Create a 15-case evaluation dataset measuring JSON validity, precision, and latency.',
            practicalExercise: 'Write a Node test runner that scores prompt versions and outputs a diff table.',
            resourceTitle: 'Evaluating GenAI Applications',
            resourceUrl: 'https://ai.google.dev/gemini-api/docs',
          },
          {
            title: 'Containerized CI/CD & Health Probes',
            focusSkill: 'Containerized CI/CD',
            dailyTask: 'Write a multi-stage Dockerfile and automated typecheck + build pipeline.',
            practicalExercise: 'Add /api/health readiness checks and verify clean container startup.',
            resourceTitle: 'Docker Multi-Stage Builds',
            resourceUrl: 'https://docs.docker.com/build/building/multi-stage/',
          },
        ];
        const t = templates[idx % templates.length];
        return {
          day,
          week: Math.min(week, 4),
          title: `Day ${day}: ${t.title}`,
          focusSkill: t.focusSkill,
          dailyTask: t.dailyTask,
          practicalExercise: t.practicalExercise,
          resourceTitle: t.resourceTitle,
          resourceUrl: t.resourceUrl,
          estimatedMinutes: 45 + (idx % 3) * 15,
        };
      }),
    },
    agentsExecuted: [
      { agent: 'Resume Analysis Agent', status: 'completed', mode: 'demo' },
      { agent: 'Hidden Skill Discovery Agent', status: 'completed', mode: 'demo' },
      { agent: 'Skill Gap Analysis Agent', status: 'completed', mode: 'demo' },
      { agent: 'Career Matching Agent', status: 'completed', mode: 'demo' },
      { agent: 'Learning Mentor Agent', status: 'completed', mode: 'demo' },
    ],
  };
}

function seedDemoAccount() {
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('alex.rivera@skillxray.ai') as { id: number } | undefined;

  if (existing) return;

  const passwordHash = bcrypt.hashSync('SkillXRay2026!', 10);
  const insertUser = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role_title, target_role, bio)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      'Alex Rivera',
      'alex.rivera@skillxray.ai',
      passwordHash,
      'Full-Stack Software Engineer',
      'AI Product Engineer',
      'Building reliable web products, interactive analytics dashboards, and human-centered AI workflows.'
    );

  const userId = Number(insertUser.lastInsertRowid);
  const seedPayload = buildSeedAnalysis();
  const insertAnalysis = db
    .prepare(
      `INSERT INTO analyses (user_id, title, resume_filename, target_role, raw_text, project_descriptions, result_json, mode_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      'Full-Stack & AI Product X-Ray',
      'alex_rivera_resume.pdf',
      'AI Product Engineer',
      'Alex Rivera — Full-Stack Software Engineer. TypeScript, React, Python, Node.js, SQL, Docker. Reduced API latency by 42% via batched database queries and caching.',
      'Led a 4-person hackathon team to ship an accessible analytics portal in 48 hours. Automated PDF intake workflows reducing manual review from 20m to 15s.',
      JSON.stringify(seedPayload),
      'demo'
    );

  const analysisId = Number(insertAnalysis.lastInsertRowid);
  const insertProgress = db.prepare(
    'INSERT OR IGNORE INTO roadmap_progress (user_id, analysis_id, day_number, completed) VALUES (?, ?, ?, 1)'
  );
  for (const day of [1, 2, 3, 4, 5, 6]) {
    insertProgress.run(userId, analysisId, day);
  }

  db.prepare(
    'INSERT INTO mentor_messages (user_id, role, content) VALUES (?, ?, ?)'
  ).run(
    userId,
    'assistant',
    'Welcome back, Alex. Your latest Skill X-Ray shows 91% alignment with AI Product Engineer roles. Focus on Day 7 today to strengthen RAG & Vector Indexing.'
  );
}

seedDemoAccount();

export function findUserByEmail(email: string) {
  return db
    .prepare('SELECT * FROM users WHERE lower(email) = lower(?)')
    .get(email.trim()) as
    | {
        id: number;
        name: string;
        email: string;
        password_hash: string;
        role_title: string;
        target_role: string;
        bio: string;
        created_at: string;
      }
    | undefined;
}

export function findUserById(id: number): UserProfile | undefined {
  const row = db
    .prepare(
      'SELECT id, name, email, role_title, target_role, bio, created_at FROM users WHERE id = ?'
    )
    .get(id) as
    | {
        id: number;
        name: string;
        email: string;
        role_title: string;
        target_role: string;
        bio: string;
        created_at: string;
      }
    | undefined;
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleTitle: row.role_title,
    targetRole: row.target_role,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

export function createUser(
  name: string,
  email: string,
  passwordHash: string,
  roleTitle = 'Software Builder',
  targetRole = 'AI Systems Engineer'
): UserProfile {
  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role_title, target_role)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(name.trim(), email.trim().toLowerCase(), passwordHash, roleTitle, targetRole);
  return findUserById(Number(result.lastInsertRowid))!;
}

export function updateUserProfile(
  userId: number,
  updates: { name: string; roleTitle: string; targetRole: string; bio: string }
): UserProfile {
  db.prepare(
    `UPDATE users SET name = ?, role_title = ?, target_role = ?, bio = ? WHERE id = ?`
  ).run(
    updates.name.trim(),
    updates.roleTitle.trim(),
    updates.targetRole.trim(),
    updates.bio.trim(),
    userId
  );
  return findUserById(userId)!;
}

export function saveAnalysis(params: {
  userId: number;
  title: string;
  resumeFilename: string | null;
  targetRole: string;
  rawText: string;
  projectDescriptions: string;
  result: FullSkillXRayPayload;
  modeUsed: 'gemini' | 'demo';
}): AnalysisRecord {
  const insert = db
    .prepare(
      `INSERT INTO analyses (user_id, title, resume_filename, target_role, raw_text, project_descriptions, result_json, mode_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.userId,
      params.title,
      params.resumeFilename,
      params.targetRole,
      params.rawText,
      params.projectDescriptions,
      JSON.stringify(params.result),
      params.modeUsed
    );

  return getAnalysisById(Number(insert.lastInsertRowid), params.userId)!;
}

export function updateAnalysisResult(
  analysisId: number,
  userId: number,
  result: FullSkillXRayPayload
) {
  db.prepare('UPDATE analyses SET result_json = ? WHERE id = ? AND user_id = ?').run(
    JSON.stringify(result),
    analysisId,
    userId
  );
}

export function listAnalysesByUser(userId: number): AnalysisRecord[] {
  const rows = db
    .prepare('SELECT * FROM analyses WHERE user_id = ? ORDER BY datetime(created_at) DESC, id DESC')
    .all(userId) as Array<{
    id: number;
    user_id: number;
    title: string;
    resume_filename: string | null;
    target_role: string;
    result_json: string;
    mode_used: 'gemini' | 'demo';
    created_at: string;
  }>;

  return rows.map((row) => {
    const completedRows = db
      .prepare(
        'SELECT day_number FROM roadmap_progress WHERE user_id = ? AND analysis_id = ? AND completed = 1 ORDER BY day_number ASC'
      )
      .all(userId, row.id) as Array<{ day_number: number }>;

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      resumeFilename: row.resume_filename,
      targetRole: row.target_role,
      modeUsed: row.mode_used,
      createdAt: row.created_at,
      result: JSON.parse(row.result_json) as FullSkillXRayPayload,
      completedDays: completedRows.map((r) => r.day_number),
    };
  });
}

export function getAnalysisById(id: number, userId: number): AnalysisRecord | undefined {
  const row = db
    .prepare('SELECT * FROM analyses WHERE id = ? AND user_id = ?')
    .get(id, userId) as
    | {
        id: number;
        user_id: number;
        title: string;
        resume_filename: string | null;
        target_role: string;
        result_json: string;
        mode_used: 'gemini' | 'demo';
        created_at: string;
      }
    | undefined;

  if (!row) return undefined;

  const completedRows = db
    .prepare(
      'SELECT day_number FROM roadmap_progress WHERE user_id = ? AND analysis_id = ? AND completed = 1 ORDER BY day_number ASC'
    )
    .all(userId, row.id) as Array<{ day_number: number }>;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    resumeFilename: row.resume_filename,
    targetRole: row.target_role,
    modeUsed: row.mode_used,
    createdAt: row.created_at,
    result: JSON.parse(row.result_json) as FullSkillXRayPayload,
    completedDays: completedRows.map((r) => r.day_number),
  };
}

export function deleteAnalysis(id: number, userId: number): boolean {
  const res = db
    .prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return res.changes > 0;
}

export function toggleRoadmapDay(
  userId: number,
  analysisId: number,
  dayNumber: number
): number[] {
  const existing = db
    .prepare(
      'SELECT id, completed FROM roadmap_progress WHERE user_id = ? AND analysis_id = ? AND day_number = ?'
    )
    .get(userId, analysisId, dayNumber) as { id: number; completed: number } | undefined;

  if (existing) {
    const next = existing.completed === 1 ? 0 : 1;
    db.prepare(
      "UPDATE roadmap_progress SET completed = ?, completed_at = datetime('now') WHERE id = ?"
    ).run(next, existing.id);
  } else {
    db.prepare(
      'INSERT INTO roadmap_progress (user_id, analysis_id, day_number, completed) VALUES (?, ?, ?, 1)'
    ).run(userId, analysisId, dayNumber);
  }

  const rows = db
    .prepare(
      'SELECT day_number FROM roadmap_progress WHERE user_id = ? AND analysis_id = ? AND completed = 1 ORDER BY day_number ASC'
    )
    .all(userId, analysisId) as Array<{ day_number: number }>;
  return rows.map((r) => r.day_number);
}

export function listMentorMessages(userId: number): MentorMessage[] {
  return db
    .prepare(
      'SELECT id, role, content, created_at as createdAt FROM mentor_messages WHERE user_id = ? ORDER BY id ASC'
    )
    .all(userId) as unknown as MentorMessage[];
}

export function addMentorMessage(
  userId: number,
  role: 'user' | 'assistant',
  content: string
): MentorMessage {
  const res = db
    .prepare('INSERT INTO mentor_messages (user_id, role, content) VALUES (?, ?, ?)')
    .run(userId, role, content);
  return db
    .prepare('SELECT id, role, content, created_at as createdAt FROM mentor_messages WHERE id = ?')
    .get(Number(res.lastInsertRowid)) as unknown as MentorMessage;
}

export function clearMentorMessages(userId: number) {
  db.prepare('DELETE FROM mentor_messages WHERE user_id = ?').run(userId);
}
