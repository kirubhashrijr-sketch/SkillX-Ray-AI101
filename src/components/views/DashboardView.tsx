import { ArrowRight, Bot, Compass, Map, Radar, ScanSearch } from 'lucide-react';
import type { AnalysisRecord, UserProfile } from '../../types/skillxray';
import { DomainRadarChart, SkillDistributionDoughnut } from '../ChartWidgets';
import type { WorkspaceTab } from '../Sidebar';

interface DashboardViewProps {
  user: UserProfile;
  analysis: AnalysisRecord | undefined;
  analysesCount: number;
  onNavigate: (tab: WorkspaceTab) => void;
}

export function DashboardView({
  user,
  analysis,
  analysesCount,
  onNavigate,
}: DashboardViewProps) {
  if (!analysis) {
    return (
      <div className="space-y-8">
        <div className="glass-surface-elevated rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-white">
            Welcome to SkillX-Ray AI, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            You have not run a Skill X-Ray scan yet. Upload a PDF resume or describe your shipped
            projects so all five AI agents can uncover your hidden strengths, benchmark skill gaps,
            match ideal roles, and build your 30-day roadmap.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('analysis')}
              className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Run Your First AI Analysis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const skills = analysis.result.skillGap.skills;
  const strongCount = skills.filter((s) => s.bucket === 'strong').length;
  const hiddenCount = skills.filter((s) => s.bucket === 'hidden').length;
  const topCareer = analysis.result.careerMatching.topCareers[0];
  const roadmapPct = Math.round((analysis.completedDays.length / 30) * 100);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-400">
            Active Analysis · {analysis.title}
          </p>
          <h1 className="mt-1.5 font-display text-2xl md:text-3xl font-bold text-white">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {analysis.result.skillGap.summary}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('analysis')}
            className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            <ScanSearch className="h-4 w-4" />
            New Analysis
          </button>
          <button
            type="button"
            onClick={() => onNavigate('xray')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Radar className="h-4 w-4 text-blue-400" />
            Skill X-Ray
          </button>
          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Map className="h-4 w-4 text-violet-400" />
            Roadmap
          </button>
        </div>
      </div>

      {/* 5 Core KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Total Skills Discovered</p>
          <p className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
            {skills.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Across 4 X-Ray buckets</p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Strong Skills</p>
          <p className="mt-2 font-mono text-3xl font-bold text-blue-400 tabular-nums">
            {strongCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Production-verified strengths</p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Hidden Skills</p>
          <p className="mt-2 font-mono text-3xl font-bold text-violet-400 tabular-nums">
            {hiddenCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Inferred from project evidence</p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Top Career Match</p>
          <p className="mt-2 font-mono text-3xl font-bold text-emerald-400 tabular-nums">
            {topCareer?.matchPercentage ?? analysis.result.skillGap.readinessScore}%
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {topCareer?.title ?? analysis.targetRole}
          </p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Learning Progress</p>
          <p className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
            {roadmapPct}%
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {analysis.completedDays.length} of 30 days complete
          </p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 glass-surface rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Capability Radar vs. Benchmark
              </h2>
              <p className="text-xs text-slate-400">
                Six-axis assessment across architecture, code, AI, and leadership
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('xray')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Inspect Details
            </button>
          </div>
          <div className="mt-6 h-[310px]">
            <DomainRadarChart scores={analysis.result.skillGap.domainScores} />
          </div>
        </div>

        <div className="lg:col-span-5 glass-surface rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Skill X-Ray Distribution
              </h2>
              <p className="text-xs text-slate-400">
                Breakdown by readiness and visibility tier
              </p>
            </div>
          </div>
          <div className="mt-6 h-[310px]">
            <SkillDistributionDoughnut skills={skills} />
          </div>
        </div>
      </div>

      {/* Recent Analysis & Quick Shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 glass-surface rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              Recent Analysis Summary
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">
              {analysesCount} saved {analysesCount === 1 ? 'scan' : 'scans'}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {analysis.result.resumeAnalysis.summary}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-800/80 pt-5">
            <div>
              <p className="text-xs font-medium text-slate-400">Detected Experience Level</p>
              <p className="mt-1 text-sm font-medium text-white">
                {analysis.result.resumeAnalysis.experienceLevel}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Hidden Skills Synthesis</p>
              <p className="mt-1 text-sm text-slate-300">
                {analysis.result.hiddenSkills.synthesisNote}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 glass-surface rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Next Recommended Step</h2>
            <p className="mt-2 text-sm text-slate-300">
              Continue Day {Math.min(analysis.completedDays.length + 1, 30)} of your{' '}
              {analysis.result.learningRoadmap.targetCareer} roadmap or ask your AI Mentor for
              interview framing.
            </p>
          </div>
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate('careers')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 hover:border-blue-500/40 hover:text-white transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-blue-400" />
                Explore Top 3 Career Matches
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('mentor')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 hover:border-violet-500/40 hover:text-white transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                <Bot className="h-4 w-4 text-violet-400" />
                Ask Learning Mentor Agent
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
