import { useState } from 'react';
import {
  ArrowRight,
  Compass,
  FileSearch,
  Layers,
  Map,
  Radar,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'signup') => void;
}

const HERO_IMAGE = '/src/assets/images/hero_skill_xray_1794644489871.jpg';

const FEATURES = [
  {
    num: '01',
    icon: FileSearch,
    title: 'Resume & Project Analyzer',
    description:
      'Upload any PDF resume and paste raw project narratives. Extracts technical stacks, soft skills, tools, and quantified achievements with zero manual formatting.',
    outcome: 'Full candidate capability baseline in seconds',
  },
  {
    num: '02',
    icon: ScanSearch,
    title: 'Hidden Skill Detector',
    description:
      'Uncovers latent technical, communication, leadership, and problem-solving capabilities buried inside project decisions, paired with verbatim evidence quotes.',
    outcome: 'Surface strengths missing from your bullet points',
  },
  {
    num: '03',
    icon: Radar,
    title: 'Interactive Skill X-Ray',
    description:
      'Classifies every skill into Strong, Hidden, Developing, or Missing buckets and renders live Chart.js radar, distribution, and demand comparisons.',
    outcome: 'Instant visual clarity on role readiness',
  },
  {
    num: '04',
    icon: Compass,
    title: 'AI Career Matching',
    description:
      'Ranks your top three target roles with realistic match percentages, matched vs. missing skill inventories, and market growth context.',
    outcome: 'Prioritize roles where your profile stands out',
  },
  {
    num: '05',
    icon: Map,
    title: '30-Day Adaptive Roadmap',
    description:
      'Generates a day-by-day execution plan featuring focused study tasks, hands-on engineering drills, curated documentation, and interactive progress tracking.',
    outcome: 'Close critical skill gaps in four structured weeks',
  },
];

const AGENTS = [
  {
    step: '01',
    name: 'Resume Analysis Agent',
    role: 'Parses PDF resumes and project descriptions into structured technical skills, soft skills, tools, and measurable achievements.',
  },
  {
    step: '02',
    name: 'Hidden Skill Discovery Agent',
    role: 'Detects unstated engineering judgment, leadership, communication, and analytical problem-solving with cited evidence.',
  },
  {
    step: '03',
    name: 'Skill Gap Analysis Agent',
    role: 'Benchmarks capabilities across six core dimensions and sorts skills into Strong, Hidden, Developing, and Missing tiers.',
  },
  {
    step: '04',
    name: 'Career Matching Agent',
    role: 'Synthesizes explicit and hidden competencies to match your profile against three high-fit technology career paths.',
  },
  {
    step: '05',
    name: 'Learning Mentor Agent',
    role: 'Builds your personalized 30-day roadmap and provides ongoing coaching grounded in your Skill X-Ray data.',
  },
];

export function LandingPage({ onNavigateAuth }: LandingPageProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100">
      {/* Subtle radial atmospheric depth */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/12 blur-[130px]" />
        <div className="absolute top-24 right-1/5 h-[420px] w-[420px] rounded-full bg-violet-600/12 blur-[140px]" />
      </div>

      {/* Top Navigation — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060A14]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            SkillX-Ray AI
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            <a
              href="#features"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#agents"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              AI Agents
            </a>
            <button
              type="button"
              onClick={() => onNavigateAuth('login')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigateAuth('signup')}
              className="btn-primary-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* Hero Split Section */}
        <section className="mx-auto max-w-7xl px-6 pt-14 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-blue-400">
                Multi-Agent Career Intelligence Platform
              </p>
              <h1
                className="mt-4 font-display font-bold tracking-tight text-white"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.65rem)',
                  lineHeight: 1.08,
                  textWrap: 'balance',
                }}
              >
                Discover Your Hidden Skills. Unlock Your Future.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
                Resumes rarely capture what you actually know how to build. SkillX-Ray AI runs five
                specialized Gemini agents across your PDF resume and project descriptions to expose
                hidden strengths, map market skill gaps, match ideal roles, and assemble a 30-day
                execution roadmap.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigateAuth('signup')}
                  className="btn-primary-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Start Free Skill X-Ray
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateAuth('login')}
                  className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-5 py-3 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Log In to Workspace
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                <span>PDF Resume Extraction</span>
                <span aria-hidden="true">·</span>
                <span>5 Specialized AI Agents</span>
                <span aria-hidden="true">·</span>
                <span>Interactive Chart.js Skill X-Ray</span>
                <span aria-hidden="true">·</span>
                <span>30-Day Adaptive Roadmap</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                {!heroImgFailed ? (
                  <img
                    src={HERO_IMAGE}
                    alt="Optical prism refracting electric blue and violet telemetry beams"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#0B1430] to-violet-950 p-8 text-center">
                    <Layers className="h-12 w-12 text-blue-400" />
                    <p className="mt-4 font-display text-lg font-semibold text-white">
                      SkillX-Ray Optical Engine
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060A14]/90 via-[#060A14]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-medium text-blue-300">
                    Evidence-Grounded Skill Mapping
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    Separates explicit credentials from hidden leadership, architecture, and
                    problem-solving signals across your shipped projects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Quantitative Proof Row below Hero Split */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 lg:grid-cols-4">
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">5 Agents</p>
              <p className="mt-1 text-sm text-slate-400">Coordinated multi-stage analysis</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">4 Tiers</p>
              <p className="mt-1 text-sm text-slate-400">Strong, Hidden, Developing & Missing</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">Top 3</p>
              <p className="mt-1 text-sm text-slate-400">Role matches with gap breakdowns</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">30 Days</p>
              <p className="mt-1 text-sm text-slate-400">Daily adaptive tasks & hands-on drills</p>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-800/70">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-400">Platform Capabilities</p>
            <h2
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Five integrated modules turning raw experience into a clear career blueprint
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              const spanClass = idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
              return (
                <div
                  key={feat.num}
                  className={`${spanClass} glass-surface rounded-2xl p-6 flex flex-col justify-between transition-colors hover:border-slate-700`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-400">
                        {feat.num}
                      </span>
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-white">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {feat.description}
                    </p>
                  </div>
                  <p className="mt-6 border-t border-slate-800/80 pt-4 text-xs font-medium text-violet-300">
                    {feat.outcome}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-800/70"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-violet-400">How It Works</p>
            <h2
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              From PDF upload to a tracked 30-day execution plan in three steps
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-surface rounded-2xl p-6">
              <p className="font-mono text-sm font-semibold text-blue-400">Step 01</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Upload Resume & Project Context
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Drop in your PDF resume and describe projects, hackathons, or architecture decisions
                you shipped.
              </p>
            </div>
            <div className="glass-surface rounded-2xl p-6">
              <p className="font-mono text-sm font-semibold text-violet-400">Step 02</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Inspect Your Skill X-Ray & Matches
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Review evidence-backed hidden skills, Chart.js radar benchmarks, and top three
                career recommendations.
              </p>
            </div>
            <div className="glass-surface rounded-2xl p-6">
              <p className="font-mono text-sm font-semibold text-blue-400">Step 03</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Execute Daily With AI Mentor
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Check off daily 45-minute tasks across your 30-day roadmap and ask the Learning
                Mentor Agent for interview prep or technical coaching.
              </p>
            </div>
          </div>
        </section>

        {/* Five Specialized Agents */}
        <section id="agents" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-800/70">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-sm font-medium text-blue-400">Multi-Agent Pipeline</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
                Five specialized agents working in concert
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Instead of a single generic prompt, SkillX-Ray AI orchestrates dedicated Gemini
                agents with structured JSON schemas and resilient fallback mode.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Server-side AI execution with hashed session authentication</span>
              </div>
            </div>

            <div className="lg:col-span-8 divide-y divide-slate-800/80 glass-surface rounded-2xl">
              {AGENTS.map((agent) => (
                <div key={agent.step} className="flex items-start gap-5 p-6">
                  <span className="font-mono text-sm font-semibold text-blue-400 pt-0.5">
                    {agent.step}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {agent.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{agent.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Conversion Band */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="glass-surface-elevated rounded-2xl p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold text-white">
                Ready to see what your resume leaves unsaid?
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Create an account in seconds or explore immediately with the built-in sample
                engineering profile.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateAuth('login')}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigateAuth('signup')}
                className="btn-primary-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Professional Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050811]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base font-bold text-white">SkillX-Ray AI</p>
            <p className="mt-1 text-xs text-slate-400">
              Discover Your Hidden Skills. Unlock Your Future.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#agents" className="hover:text-white transition-colors">
              AI Agents
            </a>
            <button
              type="button"
              onClick={() => onNavigateAuth('login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SkillX-Ray AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
