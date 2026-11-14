import { useState } from 'react';
import { Search } from 'lucide-react';
import type { AnalysisRecord, SkillXRayEntry } from '../../types/skillxray';
import {
  DomainRadarChart,
  SkillDistributionDoughnut,
  SkillProficiencyBarChart,
} from '../ChartWidgets';

interface SkillXRayViewProps {
  analysis: AnalysisRecord | undefined;
  onGoAnalyze: () => void;
}

type BucketFilter = 'all' | 'strong' | 'hidden' | 'developing' | 'missing';

const BUCKET_META: Record<
  SkillXRayEntry['bucket'],
  { label: string; textClass: string; barClass: string }
> = {
  strong: { label: 'Strong', textClass: 'text-blue-400', barClass: 'bg-blue-500' },
  hidden: { label: 'Hidden', textClass: 'text-violet-400', barClass: 'bg-violet-500' },
  developing: { label: 'Developing', textClass: 'text-amber-400', barClass: 'bg-amber-500' },
  missing: { label: 'Missing', textClass: 'text-red-400', barClass: 'bg-red-500' },
};

export function SkillXRayView({ analysis, onGoAnalyze }: SkillXRayViewProps) {
  const [filter, setFilter] = useState<BucketFilter>('all');
  const [query, setQuery] = useState('');

  if (!analysis) {
    return (
      <div className="glass-surface-elevated rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">No Skill X-Ray Data Yet</h1>
        <p className="mt-2 text-sm text-slate-300">
          Run an AI Analysis first to generate your interactive radar, distribution, and gap
          visualizations.
        </p>
        <button
          type="button"
          onClick={onGoAnalyze}
          className="btn-primary-gradient mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
        >
          Go to AI Analysis
        </button>
      </div>
    );
  }

  const { skills, domainScores, readinessScore, summary } = analysis.result.skillGap;

  const filteredSkills = skills.filter((s) => {
    const matchesBucket = filter === 'all' || s.bucket === filter;
    const matchesSearch =
      !query.trim() ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-400">
            Interactive Skill X-Ray · {analysis.targetRole}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">
            Skill Competency & Gap Diagnostics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{summary}</p>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <p className="text-xs text-slate-400">Overall Role Readiness</p>
          <p className="mt-1 font-mono text-4xl font-bold text-blue-400 tabular-nums">
            {readinessScore}%
          </p>
        </div>
      </div>

      {/* Charts Row 1: Radar + Doughnut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 glass-surface rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-white">
            6-Dimension Domain Radar
          </h2>
          <p className="text-xs text-slate-400">
            Your capability scores compared against target role expectations
          </p>
          <div className="mt-5 h-[320px]">
            <DomainRadarChart scores={domainScores} />
          </div>
        </div>

        <div className="lg:col-span-5 glass-surface rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-white">
            Skill Tier Composition
          </h2>
          <p className="text-xs text-slate-400">
            Ratio of Strong, Hidden, Developing, and Missing skills
          </p>
          <div className="mt-5 h-[320px]">
            <SkillDistributionDoughnut skills={skills} />
          </div>
        </div>
      </div>

      {/* Chart Row 2: Proficiency vs Market Demand Bar Chart */}
      <div className="glass-surface rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-white">
          Proficiency vs. Market Demand
        </h2>
        <p className="text-xs text-slate-400">
          Direct comparison between current capability level and industry hiring demand
        </p>
        <div className="mt-5 h-[340px]">
          <SkillProficiencyBarChart skills={skills} />
        </div>
      </div>

      {/* Filterable Skill Inventory Table */}
      <div className="glass-surface rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            {(['all', 'strong', 'hidden', 'developing', 'missing'] as BucketFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all'
                  ? `All (${skills.length})`
                  : `${tab} (${skills.filter((s) => s.bucket === tab).length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter skills or categories…"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                <th className="pb-3 pr-4">Skill</th>
                <th className="pb-3 pr-4">Tier</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4 text-right">Proficiency</th>
                <th className="pb-3 pr-4 text-right">Demand</th>
                <th className="pb-3">Agent Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredSkills.map((skill) => {
                const meta = BUCKET_META[skill.bucket];
                return (
                  <tr key={skill.name} className="hover:bg-slate-900/40">
                    <td className="py-3.5 pr-4 font-medium text-white whitespace-nowrap">
                      {skill.name}
                    </td>
                    <td className={`py-3.5 pr-4 text-xs font-semibold ${meta.textClass}`}>
                      {meta.label}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-400 whitespace-nowrap">
                      {skill.category}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono text-xs text-slate-200 tabular-nums">
                      {skill.proficiency}%
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono text-xs text-slate-400 tabular-nums">
                      {skill.marketDemand}%
                    </td>
                    <td className="py-3.5 text-xs text-slate-300 max-w-md">{skill.rationale}</td>
                  </tr>
                );
              })}
              {filteredSkills.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No skills match your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
