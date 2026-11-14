import { GoogleGenAI, Type } from '@google/genai';
import type {
  AnalysisRecord,
  CareerMatchingResult,
  FullSkillXRayPayload,
  HiddenSkillDiscoveryResult,
  LearningRoadmapResult,
  ResumeAnalysisResult,
  SkillGapResult,
} from '../src/types/skillxray.ts';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY' || key.length < 12) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-4-hydrogen';

async function generateStructuredJson<T>(
  ai: GoogleGenAI,
  systemInstruction: string,
  prompt: string,
  responseSchema: Record<string, unknown>
): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const raw = (response.text ?? '{}').trim();
  return JSON.parse(raw) as T;
}

// =========================================================
// AGENT 1: RESUME ANALYSIS AGENT
// =========================================================
export async function runResumeAnalysisAgent(
  resumeText: string,
  projectDescriptions: string
): Promise<{ data: ResumeAnalysisResult; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const data = await generateStructuredJson<ResumeAnalysisResult>(
        ai,
        'You are the Resume Analysis Agent for SkillX-Ray AI. Extract structured, accurate candidate capabilities strictly grounded in the provided resume and project text.',
        `Analyze the candidate resume and project descriptions below.\n\nRESUME TEXT:\n${resumeText.slice(0, 12000)}\n\nPROJECT DESCRIPTIONS:\n${projectDescriptions.slice(0, 6000)}`,
        {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            experienceLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            toolsAndFrameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'candidateName',
            'experienceLevel',
            'summary',
            'technicalSkills',
            'softSkills',
            'toolsAndFrameworks',
            'keyAchievements',
          ],
        }
      );
      return { data, mode: 'gemini' };
    } catch (err) {
      console.warn('[ResumeAnalysisAgent] Falling back to Demo Mode:', err);
    }
  }

  return { data: buildDemoResumeAnalysis(resumeText, projectDescriptions), mode: 'demo' };
}

// =========================================================
// AGENT 2: HIDDEN SKILL DISCOVERY AGENT
// =========================================================
export async function runHiddenSkillDiscoveryAgent(
  resumeText: string,
  projectDescriptions: string,
  resumeSummary: ResumeAnalysisResult
): Promise<{ data: HiddenSkillDiscoveryResult; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const evidenceSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            category: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            evidence: { type: Type.STRING },
            impactNote: { type: Type.STRING },
          },
          required: ['skill', 'category', 'confidence', 'evidence', 'impactNote'],
        },
      };

      const data = await generateStructuredJson<HiddenSkillDiscoveryResult>(
        ai,
        'You are the Hidden Skill Discovery Agent. Uncover implicit, unstated skills across hiddenTechnical, communication, leadership, and problemSolving based on concrete project actions, architecture choices, and outcomes. Always cite specific evidence.',
        `Explicit skills found: ${resumeSummary.technicalSkills.join(', ')}.\n\nRESUME:\n${resumeText.slice(0, 8000)}\n\nPROJECTS:\n${projectDescriptions.slice(0, 6000)}`,
        {
          type: Type.OBJECT,
          properties: {
            hiddenTechnical: evidenceSchema,
            communication: evidenceSchema,
            leadership: evidenceSchema,
            problemSolving: evidenceSchema,
            synthesisNote: { type: Type.STRING },
          },
          required: [
            'hiddenTechnical',
            'communication',
            'leadership',
            'problemSolving',
            'synthesisNote',
          ],
        }
      );
      return { data, mode: 'gemini' };
    } catch (err) {
      console.warn('[HiddenSkillDiscoveryAgent] Falling back to Demo Mode:', err);
    }
  }

  return {
    data: buildDemoHiddenSkills(resumeText, projectDescriptions, resumeSummary),
    mode: 'demo',
  };
}

// =========================================================
// AGENT 3: SKILL GAP ANALYSIS AGENT
// =========================================================
export async function runSkillGapAnalysisAgent(
  resumeSummary: ResumeAnalysisResult,
  targetRole: string
): Promise<{ data: SkillGapResult; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const data = await generateStructuredJson<SkillGapResult>(
        ai,
        'You are the Skill Gap Analysis Agent. Classify candidate capabilities into exactly four buckets: strong, hidden, developing, and missing, relative to the target role. Provide 6 domainScores (Architecture, Implementation, AI & Data, Communication, Leadership, Problem Solving) from 0 to 100.',
        `Target Role: ${targetRole || 'Senior Software / AI Engineer'}\nCandidate Summary: ${resumeSummary.summary}\nTechnical Skills: ${resumeSummary.technicalSkills.join(', ')}\nSoft Skills: ${resumeSummary.softSkills.join(', ')}\nAchievements: ${resumeSummary.keyAchievements.join(' | ')}`,
        {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            domainScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dimension: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  benchmark: { type: Type.INTEGER },
                },
                required: ['dimension', 'score', 'benchmark'],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  bucket: { type: Type.STRING },
                  proficiency: { type: Type.INTEGER },
                  marketDemand: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: [
                  'name',
                  'bucket',
                  'proficiency',
                  'marketDemand',
                  'category',
                  'rationale',
                ],
              },
            },
          },
          required: ['readinessScore', 'summary', 'domainScores', 'skills'],
        }
      );

      const normalizedSkills = data.skills.map((s) => ({
        ...s,
        bucket: (['strong', 'hidden', 'developing', 'missing'].includes(s.bucket)
          ? s.bucket
          : 'developing') as 'strong' | 'hidden' | 'developing' | 'missing',
      }));

      return { data: { ...data, skills: normalizedSkills }, mode: 'gemini' };
    } catch (err) {
      console.warn('[SkillGapAnalysisAgent] Falling back to Demo Mode:', err);
    }
  }

  return { data: buildDemoSkillGap(resumeSummary, targetRole), mode: 'demo' };
}

// =========================================================
// AGENT 4: CAREER MATCHING AGENT
// =========================================================
export async function runCareerMatchingAgent(
  resumeSummary: ResumeAnalysisResult,
  targetRole: string
): Promise<{ data: CareerMatchingResult; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const data = await generateStructuredJson<CareerMatchingResult>(
        ai,
        'You are the Career Matching Agent. Recommend exactly 3 high-fit modern technology careers with realistic matchPercentage (65-96), salaryRange, demandGrowth, matchedSkills, missingSkills, description, and whyItFits.',
        `Target Role Preference: ${targetRole || 'Open to best match'}\nSummary: ${resumeSummary.summary}\nTechnical Skills: ${resumeSummary.technicalSkills.join(', ')}\nSoft Skills: ${resumeSummary.softSkills.join(', ')}\nAchievements: ${resumeSummary.keyAchievements.join('; ')}`,
        {
          type: Type.OBJECT,
          properties: {
            topCareers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  matchPercentage: { type: Type.INTEGER },
                  salaryRange: { type: Type.STRING },
                  demandGrowth: { type: Type.STRING },
                  description: { type: Type.STRING },
                  matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whyItFits: { type: Type.STRING },
                },
                required: [
                  'title',
                  'matchPercentage',
                  'salaryRange',
                  'demandGrowth',
                  'description',
                  'matchedSkills',
                  'missingSkills',
                  'whyItFits',
                ],
              },
            },
          },
          required: ['topCareers'],
        }
      );
      return { data: { topCareers: data.topCareers.slice(0, 3) }, mode: 'gemini' };
    } catch (err) {
      console.warn('[CareerMatchingAgent] Falling back to Demo Mode:', err);
    }
  }

  return { data: buildDemoCareers(resumeSummary, targetRole), mode: 'demo' };
}

// =========================================================
// AGENT 5: LEARNING MENTOR AGENT
// =========================================================
export async function runLearningMentorAgent(
  targetCareer: string,
  missingSkills: string[],
  developingSkills: string[]
): Promise<{ data: LearningRoadmapResult; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const data = await generateStructuredJson<LearningRoadmapResult>(
        ai,
        'You are the Learning Mentor Agent. Create a structured, realistic 30-day adaptive learning roadmap (exactly 30 days) targeting the career and closing missing/developing skills with concrete daily tasks, practical exercises, and reputable documentation URLs.',
        `Target Career: ${targetCareer}\nMissing Skills: ${missingSkills.join(', ')}\nDeveloping Skills: ${developingSkills.join(', ')}`,
        {
          type: Type.OBJECT,
          properties: {
            targetCareer: { type: Type.STRING },
            overview: { type: Type.STRING },
            weeklyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  week: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focusSkill: { type: Type.STRING },
                  dailyTask: { type: Type.STRING },
                  practicalExercise: { type: Type.STRING },
                  resourceTitle: { type: Type.STRING },
                  resourceUrl: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                },
                required: [
                  'day',
                  'week',
                  'title',
                  'focusSkill',
                  'dailyTask',
                  'practicalExercise',
                  'resourceTitle',
                  'resourceUrl',
                  'estimatedMinutes',
                ],
              },
            },
          },
          required: ['targetCareer', 'overview', 'weeklyThemes', 'days'],
        }
      );

      // Guarantee 30 normalized days
      const normalizedDays =
        data.days.length >= 30
          ? data.days.slice(0, 30)
          : buildDemoRoadmap(targetCareer, missingSkills, developingSkills).days.map(
              (fallback, i) => data.days[i] ?? fallback
            );

      return {
        data: {
          ...data,
          days: normalizedDays.map((d, i) => ({
            ...d,
            day: i + 1,
            week: Math.min(Math.ceil((i + 1) / 7), 4),
          })),
        },
        mode: 'gemini',
      };
    } catch (err) {
      console.warn('[LearningMentorAgent] Falling back to Demo Mode:', err);
    }
  }

  return {
    data: buildDemoRoadmap(targetCareer, missingSkills, developingSkills),
    mode: 'demo',
  };
}

export async function runFullSkillXRayPipeline(params: {
  resumeText: string;
  projectDescriptions: string;
  targetRole: string;
}): Promise<{ payload: FullSkillXRayPayload; overallMode: 'gemini' | 'demo' }> {
  const agent1 = await runResumeAnalysisAgent(params.resumeText, params.projectDescriptions);

  const [agent2, agent3, agent4] = await Promise.all([
    runHiddenSkillDiscoveryAgent(params.resumeText, params.projectDescriptions, agent1.data),
    runSkillGapAnalysisAgent(agent1.data, params.targetRole),
    runCareerMatchingAgent(agent1.data, params.targetRole),
  ]);

  const primaryCareer =
    params.targetRole.trim() || agent4.data.topCareers[0]?.title || 'AI Product Engineer';
  const missing = agent3.data.skills
    .filter((s) => s.bucket === 'missing')
    .map((s) => s.name);
  const developing = agent3.data.skills
    .filter((s) => s.bucket === 'developing')
    .map((s) => s.name);

  const agent5 = await runLearningMentorAgent(primaryCareer, missing, developing);

  const modes = [agent1.mode, agent2.mode, agent3.mode, agent4.mode, agent5.mode];
  const overallMode: 'gemini' | 'demo' = modes.includes('gemini') ? 'gemini' : 'demo';

  return {
    overallMode,
    payload: {
      resumeAnalysis: agent1.data,
      hiddenSkills: agent2.data,
      skillGap: agent3.data,
      careerMatching: agent4.data,
      learningRoadmap: agent5.data,
      agentsExecuted: [
        { agent: 'Resume Analysis Agent', status: 'completed', mode: agent1.mode },
        { agent: 'Hidden Skill Discovery Agent', status: 'completed', mode: agent2.mode },
        { agent: 'Skill Gap Analysis Agent', status: 'completed', mode: agent3.mode },
        { agent: 'Career Matching Agent', status: 'completed', mode: agent4.mode },
        { agent: 'Learning Mentor Agent', status: 'completed', mode: agent5.mode },
      ],
    },
  };
}

export async function runMentorChatAgent(
  question: string,
  latestAnalysis: AnalysisRecord | undefined,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ reply: string; mode: 'gemini' | 'demo' }> {
  const ai = getGeminiClient();
  const contextSummary = latestAnalysis
    ? `Candidate target role: ${latestAnalysis.result.learningRoadmap.targetCareer}. Readiness: ${latestAnalysis.result.skillGap.readinessScore}%. Strong skills: ${latestAnalysis.result.skillGap.skills
        .filter((s) => s.bucket === 'strong')
        .map((s) => s.name)
        .join(', ')}. Hidden skills: ${latestAnalysis.result.skillGap.skills
        .filter((s) => s.bucket === 'hidden')
        .map((s) => s.name)
        .join(', ')}. Missing skills: ${latestAnalysis.result.skillGap.skills
        .filter((s) => s.bucket === 'missing')
        .map((s) => s.name)
        .join(', ')}. Completed roadmap days: ${latestAnalysis.completedDays.length}/30.`
    : 'No Skill X-Ray scan saved yet.';

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Recent chat:\n${history
          .slice(-6)
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n')}\n\nUser question: ${question}`,
        config: {
          systemInstruction: `You are the Learning Mentor Agent inside SkillX-Ray AI. Give crisp, practical, actionable career and study guidance in 2-4 concise paragraphs or bullet points based on the candidate's Skill X-Ray data.\nContext: ${contextSummary}`,
        },
      });
      if (response.text?.trim()) {
        return { reply: response.text.trim(), mode: 'gemini' };
      }
    } catch (err) {
      console.warn('[MentorChatAgent] Falling back to Demo Mode:', err);
    }
  }

  // Deterministic grounded mentor response in Demo Mode
  const qLower = question.toLowerCase();
  if (!latestAnalysis) {
    return {
      mode: 'demo',
      reply:
        'Start by running your first scan in AI Analysis (upload a PDF resume or paste a project description). Once your Skill X-Ray is ready, I can coach you on interview stories, missing skills, and daily roadmap priorities.',
    };
  }

  const missing = latestAnalysis.result.skillGap.skills
    .filter((s) => s.bucket === 'missing')
    .map((s) => s.name);
  const hidden = latestAnalysis.result.skillGap.skills
    .filter((s) => s.bucket === 'hidden')
    .map((s) => s.name);
  const topCareer = latestAnalysis.result.careerMatching.topCareers[0];

  if (qLower.includes('interview') || qLower.includes('story') || qLower.includes('resume')) {
    return {
      mode: 'demo',
      reply: `For ${topCareer?.title ?? 'your target role'} interviews, lead with your hidden strengths (${hidden.join(', ') || 'systems ownership'}). Frame each project using Situation -> Technical Constraint -> Measurable Outcome, and explicitly highlight how you bridged missing gaps like ${missing[0] ?? 'production observability'}.`,
    };
  }

  if (qLower.includes('week') || qLower.includes('today') || qLower.includes('next') || qLower.includes('roadmap')) {
    const nextDayNum = Math.min(latestAnalysis.completedDays.length + 1, 30);
    const nextDay = latestAnalysis.result.learningRoadmap.days.find((d) => d.day === nextDayNum);
    return {
      mode: 'demo',
      reply: `You have completed ${latestAnalysis.completedDays.length}/30 roadmap days. Your next priority is **${nextDay?.title ?? 'Day 1'}** focusing on **${nextDay?.focusSkill ?? missing[0] ?? 'Core Skill'}** (~${nextDay?.estimatedMinutes ?? 45} min).\n\nTask: ${nextDay?.dailyTask ?? 'Review core concepts'}\nHands-on drill: ${nextDay?.practicalExercise ?? 'Build a focused mini-module'}`,
    };
  }

  return {
    mode: 'demo',
    reply: `Based on your ${latestAnalysis.result.skillGap.readinessScore}% readiness for **${topCareer?.title ?? latestAnalysis.targetRole}**, your highest-leverage focus right now is closing **${missing.join(' and ') || 'advanced system evaluation'}** while showcasing your hidden capability in **${hidden[0] ?? 'fault-tolerant delivery'}**. Ask me for an interview pitch, a daily study drill, or a portfolio project idea.`,
  };
}

// =========================================================
// DEMO MODE HEURISTIC BUILDERS (TAILORED TO INPUT TEXT)
// =========================================================
const KNOWN_SKILLS_CATALOG: Array<{ pattern: RegExp; label: string; category: string }> = [
  { pattern: /\b(typescript|ts)\b/i, label: 'TypeScript', category: 'Languages' },
  { pattern: /\b(javascript|js|es6)\b/i, label: 'JavaScript', category: 'Languages' },
  { pattern: /\bpython\b/i, label: 'Python', category: 'Languages' },
  { pattern: /\breact(\.js|js)?\b/i, label: 'React', category: 'Frontend' },
  { pattern: /\bnext(\.js|js)?\b/i, label: 'Next.js', category: 'Frontend' },
  { pattern: /\bnode(\.js|js)?|express\b/i, label: 'Node.js & Express', category: 'Backend' },
  { pattern: /\bflask|django|fastapi\b/i, label: 'Python Web Frameworks', category: 'Backend' },
  { pattern: /\bsql|postgres|postgresql|sqlite|mysql\b/i, label: 'SQL & Relational Databases', category: 'Data' },
  { pattern: /\bmongodb|redis|nosql\b/i, label: 'NoSQL & Caching', category: 'Data' },
  { pattern: /\bdocker|kubernetes|k8s|ci\/cd|github actions\b/i, label: 'Docker & CI/CD', category: 'DevOps' },
  { pattern: /\baws|gcp|azure|cloud\b/i, label: 'Cloud Infrastructure', category: 'Cloud' },
  { pattern: /\bgemini|openai|llm|langchain|rag|embedding|ai\b/i, label: 'Generative AI & LLMs', category: 'AI Engineering' },
  { pattern: /\btailwind|css|html|figma|ui\/ux\b/i, label: 'UI Engineering & CSS', category: 'Frontend' },
  { pattern: /\bchart\.js|d3|tableau|analytics|visualization\b/i, label: 'Data Visualization', category: 'Analytics' },
  { pattern: /\bmachine learning|pytorch|tensorflow|scikit|pandas\b/i, label: 'Machine Learning & Python Data', category: 'AI Engineering' },
  { pattern: /\bgit|github\b/i, label: 'Git & Version Control', category: 'Tooling' },
];

function extractMatchedCatalog(combined: string) {
  return KNOWN_SKILLS_CATALOG.filter((item) => item.pattern.test(combined));
}

function buildDemoResumeAnalysis(
  resumeText: string,
  projectDescriptions: string
): ResumeAnalysisResult {
  const combined = `${resumeText}\n${projectDescriptions}`;
  const matched = extractMatchedCatalog(combined);
  const firstLine = resumeText
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 2 && l.length < 48);

  const technicalSkills =
    matched.length > 0
      ? matched.map((m) => m.label)
      : ['Python', 'JavaScript', 'REST APIs', 'SQL', 'Git'];

  const hasLeadWords = /\b(led|coordinated|managed|mentored|architected|founded)\b/i.test(combined);
  const hasOptWords = /\b(reduced|improved|optimized|latency|faster|scaled|automated)\b/i.test(combined);

  return {
    candidateName: firstLine && !firstLine.includes('@') ? firstLine : 'Candidate Profile',
    experienceLevel: hasLeadWords
      ? 'Mid-to-Senior Builder (Project Leadership Signals)'
      : 'Emerging Full-Stack & AI Builder',
    summary: `Demonstrates practical capability across ${technicalSkills.slice(0, 5).join(', ')}${
      hasOptWords ? ' with measurable optimization outcomes' : ''
    }. Combines hands-on implementation with clear execution across real-world projects.`,
    technicalSkills: technicalSkills.slice(0, 8),
    softSkills: [
      'Structured Problem Solving',
      hasLeadWords ? 'Cross-Functional Leadership' : 'Collaborative Execution',
      'Technical Communication',
      'Iterative Delivery',
    ],
    toolsAndFrameworks: technicalSkills.slice(0, 6),
    keyAchievements: [
      projectDescriptions.trim()
        ? projectDescriptions.split(/[.!?]\s+/)[0].slice(0, 140)
        : 'Delivered end-to-end software modules integrating frontend and backend services.',
      hasOptWords
        ? 'Identified performance or workflow bottlenecks and delivered measurable efficiency gains.'
        : 'Translated ambiguous requirements into shipped, testable product features.',
    ],
  };
}

function buildDemoHiddenSkills(
  resumeText: string,
  projectDescriptions: string,
  resumeSummary: ResumeAnalysisResult
): HiddenSkillDiscoveryResult {
  const combined = `${resumeText}\n${projectDescriptions}`.trim();
  const snippet =
    projectDescriptions.trim().slice(0, 130) ||
    resumeText.trim().slice(0, 130) ||
    'End-to-end project execution described in submitted materials.';

  return {
    hiddenTechnical: [
      {
        skill: 'End-to-End Systems Integration',
        category: 'Technical',
        confidence: 89,
        evidence: `Connecting ${resumeSummary.technicalSkills.slice(0, 3).join(', ')} across user workflows: "${snippet}..."`,
        impactNote: 'Shows architectural reasoning across data, API, and UI boundaries.',
      },
      {
        skill: 'Resilient Edge-Case Handling',
        category: 'Technical',
        confidence: 84,
        evidence: 'Consistent handling of input parsing, structured responses, and failure states.',
        impactNote: 'Critical differentiator for production AI and SaaS engineering teams.',
      },
    ],
    communication: [
      {
        skill: 'Outcome-Oriented Technical Storytelling',
        category: 'Communication',
        confidence: 87,
        evidence: `Frames technical choices around concrete deliverables (${resumeSummary.keyAchievements[0] ?? 'project outcomes'}).`,
        impactNote: 'Enables effective alignment with product managers and non-technical stakeholders.',
      },
    ],
    leadership: [
      {
        skill: 'Autonomous Initiative & Ownership',
        category: 'Leadership',
        confidence: 85,
        evidence: 'Demonstrates self-directed scoping and shipping from concept to working artifact.',
        impactNote: 'Strong indicator for founding engineer and product-minded IC roles.',
      },
    ],
    problemSolving: [
      {
        skill: 'First-Principles Decomposition',
        category: 'Problem-Solving',
        confidence: 90,
        evidence: `Breaks complex multi-step problems down using ${resumeSummary.technicalSkills[0] ?? 'modern tooling'}.`,
        impactNote: 'Transfers rapidly to unfamiliar stacks and AI agent workflows.',
      },
    ],
    synthesisNote:
      combined.length > 80
        ? 'Analysis uncovered 5 high-value implicit capabilities embedded in how you design, integrate, and ship projects.'
        : 'Add fuller project narratives for even deeper evidence-backed hidden skill extraction.',
  };
}

function buildDemoSkillGap(
  resumeSummary: ResumeAnalysisResult,
  targetRole: string
): SkillGapResult {
  const strongSkills = resumeSummary.technicalSkills.slice(0, 4).map((name, idx) => ({
    name,
    bucket: 'strong' as const,
    proficiency: 88 - idx * 4,
    marketDemand: 92 - idx * 2,
    category: 'Core Engineering',
    rationale: 'Explicitly demonstrated across submitted resume and project work.',
  }));

  const roleLower = targetRole.toLowerCase();
  const isData = roleLower.includes('data') || roleLower.includes('ml');

  const skills = [
    ...strongSkills,
    {
      name: 'Systems Integration',
      bucket: 'hidden' as const,
      proficiency: 84,
      marketDemand: 88,
      category: 'Architecture',
      rationale: 'Discovered from cross-layer implementation patterns.',
    },
    {
      name: 'Outcome Framing',
      bucket: 'hidden' as const,
      proficiency: 82,
      marketDemand: 85,
      category: 'Communication',
      rationale: 'Discovered from impact-focused project descriptions.',
    },
    {
      name: isData ? 'Feature Engineering & Pipelines' : 'Structured LLM Orchestration',
      bucket: 'developing' as const,
      proficiency: 63,
      marketDemand: 94,
      category: 'AI & Data',
      rationale: 'Foundational API fluency exists; needs deeper production evaluation.',
    },
    {
      name: 'Automated Testing & CI/CD',
      bucket: 'developing' as const,
      proficiency: 58,
      marketDemand: 87,
      category: 'Reliability',
      rationale: 'Benefits from end-to-end integration tests and automated pipelines.',
    },
    {
      name: isData ? 'Distributed Model Serving' : 'Vector Search & RAG Architecture',
      bucket: 'missing' as const,
      proficiency: 30,
      marketDemand: 93,
      category: 'AI Infrastructure',
      rationale: 'Key capability required for senior roles in this target track.',
    },
    {
      name: 'AI Evaluation & Telemetry',
      bucket: 'missing' as const,
      proficiency: 25,
      marketDemand: 90,
      category: 'Observability',
      rationale: 'Essential for verifying accuracy, latency, and safety in production.',
    },
  ];

  return {
    readinessScore: Math.min(89, 70 + strongSkills.length * 4),
    summary: `Strong foundation in ${strongSkills.map((s) => s.name).join(', ')}. Closing 2 targeted gaps will elevate readiness for ${targetRole || 'AI Product Engineer'} roles above 90%.`,
    domainScores: [
      { dimension: 'Architecture', score: 78, benchmark: 84 },
      { dimension: 'Implementation', score: 86, benchmark: 85 },
      { dimension: 'AI & Data', score: 65, benchmark: 82 },
      { dimension: 'Communication', score: 84, benchmark: 78 },
      { dimension: 'Leadership', score: 79, benchmark: 76 },
      { dimension: 'Problem Solving', score: 89, benchmark: 84 },
    ],
    skills,
  };
}

function buildDemoCareers(
  resumeSummary: ResumeAnalysisResult,
  targetRole: string
): CareerMatchingResult {
  const primaryTitle = targetRole.trim() || 'AI Product Engineer';
  const core = resumeSummary.technicalSkills;

  return {
    topCareers: [
      {
        title: primaryTitle,
        matchPercentage: 89,
        salaryRange: '$130k – $180k',
        demandGrowth: '+36% YoY',
        description:
          'Builds user-facing AI systems combining clean frontend architecture, reliable APIs, and structured foundation model pipelines.',
        matchedSkills: core.slice(0, 4),
        missingSkills: ['Vector Search & RAG Architecture', 'AI Evaluation & Telemetry'],
        whyItFits: 'Directly leverages your core engineering stack and systems integration instincts.',
      },
      {
        title: 'Full-Stack Solutions Engineer',
        matchPercentage: 84,
        salaryRange: '$125k – $170k',
        demandGrowth: '+26% YoY',
        description:
          'Architects rapid customer prototypes, technical integrations, and production web platforms bridging product and engineering.',
        matchedSkills: [...core.slice(0, 3), 'Technical Communication'],
        missingSkills: ['Enterprise SSO & IAM', 'Cloud Cost Modeling'],
        whyItFits: 'Matches your communication clarity and fast iterative shipping history.',
      },
      {
        title: 'Backend & Platform Engineer',
        matchPercentage: 79,
        salaryRange: '$130k – $175k',
        demandGrowth: '+21% YoY',
        description:
          'Designs high-throughput APIs, data pipelines, and resilient service infrastructure with strong observability.',
        matchedSkills: core.slice(0, 3),
        missingSkills: ['Distributed Tracing', 'Automated Testing & CI/CD'],
        whyItFits: 'Builds on your structured data modeling and optimization mindset.',
      },
    ],
  };
}

function buildDemoRoadmap(
  targetCareer: string,
  missingSkills: string[],
  developingSkills: string[]
): LearningRoadmapResult {
  const m1 = missingSkills[0] || 'Vector Search & RAG Architecture';
  const m2 = missingSkills[1] || 'AI Evaluation & Telemetry';
  const d1 = developingSkills[0] || 'Structured LLM Orchestration';
  const d2 = developingSkills[1] || 'Automated Testing & CI/CD';

  const modules = [
    {
      focus: d1,
      title: 'Schema-First Agent Prompts',
      task: 'Design typed JSON schemas and deterministic system instructions for multi-step AI tasks.',
      exercise: 'Implement a validated parser endpoint with automatic fallback recovery.',
      resourceTitle: 'Google Gemini Structured Outputs',
      resourceUrl: 'https://ai.google.dev/gemini-api/docs/structured-output',
    },
    {
      focus: m1,
      title: 'Embeddings & Semantic Retrieval',
      task: 'Chunk domain documents, generate vector embeddings, and implement top-k cosine similarity.',
      exercise: 'Build a semantic search CLI over 25 technical project notes.',
      resourceTitle: 'Gemini Embeddings & Retrieval',
      resourceUrl: 'https://ai.google.dev/gemini-api/docs/embeddings',
    },
    {
      focus: m2,
      title: 'Evaluation Harnesses & Regression Suites',
      task: 'Construct golden input/output test cases measuring accuracy, schema conformance, and latency.',
      exercise: 'Automate an eval script comparing two prompt iterations across 10 edge cases.',
      resourceTitle: 'Gemini API Best Practices',
      resourceUrl: 'https://ai.google.dev/gemini-api/docs',
    },
    {
      focus: d2,
      title: 'Production CI/CD & Resilience',
      task: 'Add integration smoke tests, environment guardrails, and containerized startup checks.',
      exercise: 'Configure a GitHub Actions workflow running typecheck, lint, and API route tests.',
      resourceTitle: 'GitHub Actions Node & Python CI',
      resourceUrl: 'https://docs.github.com/en/actions',
    },
  ];

  return {
    targetCareer,
    overview: `Personalized 30-day execution plan for ${targetCareer}, prioritizing ${m1}, ${m2}, and ${d1}.`,
    weeklyThemes: [
      `Week 1: Mastering ${d1}`,
      `Week 2: Building ${m1}`,
      `Week 3: Implementing ${m2}`,
      `Week 4: ${d2} & Portfolio Capstone`,
    ],
    days: Array.from({ length: 30 }, (_, idx) => {
      const day = idx + 1;
      const week = Math.min(Math.ceil(day / 7), 4);
      const mod = modules[(week - 1) % modules.length];
      return {
        day,
        week,
        title: `Day ${day}: ${mod.title} (Part ${((day - 1) % 7) + 1})`,
        focusSkill: mod.focus,
        dailyTask: mod.task,
        practicalExercise: mod.exercise,
        resourceTitle: mod.resourceTitle,
        resourceUrl: mod.resourceUrl,
        estimatedMinutes: 45 + (idx % 3) * 15,
      };
    }),
  };
}
