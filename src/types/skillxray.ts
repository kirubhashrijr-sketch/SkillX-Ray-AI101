export interface UserProfile {
  id: number;
  name: string;
  email: string;
  roleTitle: string;
  targetRole: string;
  bio: string;
  createdAt: string;
}

export interface ResumeAnalysisResult {
  candidateName: string;
  experienceLevel: string;
  summary: string;
  technicalSkills: string[];
  softSkills: string[];
  toolsAndFrameworks: string[];
  keyAchievements: string[];
}

export interface HiddenSkillEvidence {
  skill: string;
  category: 'Technical' | 'Communication' | 'Leadership' | 'Problem-Solving';
  confidence: number;
  evidence: string;
  impactNote: string;
}

export interface HiddenSkillDiscoveryResult {
  hiddenTechnical: HiddenSkillEvidence[];
  communication: HiddenSkillEvidence[];
  leadership: HiddenSkillEvidence[];
  problemSolving: HiddenSkillEvidence[];
  synthesisNote: string;
}

export interface SkillXRayEntry {
  name: string;
  bucket: 'strong' | 'hidden' | 'developing' | 'missing';
  proficiency: number;
  marketDemand: number;
  category: string;
  rationale: string;
}

export interface DomainDimensionScore {
  dimension: string;
  score: number;
  benchmark: number;
}

export interface SkillGapResult {
  skills: SkillXRayEntry[];
  domainScores: DomainDimensionScore[];
  readinessScore: number;
  summary: string;
}

export interface CareerMatch {
  title: string;
  matchPercentage: number;
  salaryRange: string;
  demandGrowth: string;
  description: string;
  matchedSkills: string[];
  missingSkills: string[];
  whyItFits: string;
}

export interface CareerMatchingResult {
  topCareers: CareerMatch[];
}

export interface RoadmapDay {
  day: number;
  week: number;
  title: string;
  focusSkill: string;
  dailyTask: string;
  practicalExercise: string;
  resourceTitle: string;
  resourceUrl: string;
  estimatedMinutes: number;
}

export interface LearningRoadmapResult {
  targetCareer: string;
  overview: string;
  weeklyThemes: string[];
  days: RoadmapDay[];
}

export interface FullSkillXRayPayload {
  resumeAnalysis: ResumeAnalysisResult;
  hiddenSkills: HiddenSkillDiscoveryResult;
  skillGap: SkillGapResult;
  careerMatching: CareerMatchingResult;
  learningRoadmap: LearningRoadmapResult;
  agentsExecuted: {
    agent: string;
    status: 'completed';
    mode: 'gemini' | 'demo';
  }[];
}

export interface AnalysisRecord {
  id: number;
  userId: number;
  title: string;
  resumeFilename: string | null;
  targetRole: string;
  modeUsed: 'gemini' | 'demo';
  createdAt: string;
  result: FullSkillXRayPayload;
  completedDays: number[];
}

export interface MentorMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
