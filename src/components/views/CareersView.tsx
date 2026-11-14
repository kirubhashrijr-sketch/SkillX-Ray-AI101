import { useState } from 'react';
import { ArrowRight, Check, Loader2, TrendingUp, XCircle } from 'lucide-react';
import type { AnalysisRecord } from '../../types/skillxray';

interface CareersViewProps {
  analysis: AnalysisRecord | undefined;
  onAnalysisUpdated: (updated: AnalysisRecord) => void;
  onGoRoadmap: () => void;
  onGoAnalyze: () => void;
}

export function CareersView({
  analysis,
  onAnalysisUpdated,
  onGoRoadmap,
  onGoAnalyze,
}: CareersViewProps) {
  const [regeneratingRole, setRegeneratingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="glass-surface-elevated rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">No Career Matches Yet</h1>
        <p className="mt-2 text-sm text-slate-300">
          Complete a Skill X-Ray analysis to unlock top 3 AI career recommendations.
        </p>
        <button
          type="button"
          onClick={onGoAnalyze}
          className="btn-primary-gradient mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
        >
          Run AI Analysis
        </button>
      </div>
    );
  }

  async function handleSelectCareerRoadmap(careerTitle: string) {
    if (!analysis) return;
    setError(null);
    setRegeneratingRole(careerTitle);
    try {
      const res = await fetch('/api/roadmap/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: analysis.id,
          targetCareer: careerTitle,
        }),
      });
      const data = (await res.json()) as { analysis?: AnalysisRecord; error?: string };
      if (!res.ok || !data.analysis) {
        setError(data.error || 'Failed to tailor roadmap for this role.');
        return;
      }
      onAnalysisUpdated(data.analysis);
      onGoRoadmap();
    } catch {
      setError('Network error while generating tailored roadmap.');
    } finally {
      setRegeneratingRole(null);
    }
  }

  const careers = analysis.result.careerMatching.topCareers;

  return (
    <div className="space-y-8">
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8">
        <p className="text-xs font-medium text-blue-400">Career Matching Agent</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">
          Top 3 AI-Matched Career Paths
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Ranked by alignment across your verified technical stack, hidden project competencies, and
          target role growth trajectory.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {careers.map((career, index) => {
          const isCurrentRoadmap =
            analysis.result.learningRoadmap.targetCareer.toLowerCase() ===
            career.title.toLowerCase();
          return (
            <div
              key={career.title}
              className="glass-surface rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-slate-400">Match #{index + 1}</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-white">
                      {career.title}
                    </h2>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl font-bold text-blue-400 tabular-nums">
                      {career.matchPercentage}%
                    </span>
                    <p className="text-[11px] text-slate-400">fit score</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono">
                  <span>{career.salaryRange}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {career.demandGrowth}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">{career.description}</p>

                <p className="mt-3 text-xs leading-relaxed text-violet-300">
                  <span className="font-semibold text-violet-200">Why it fits: </span>
                  {career.whyItFits}
                </p>

                <div className="mt-5 border-t border-slate-800/80 pt-4">
                  <p className="text-xs font-medium text-slate-400">Matched Skills</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-200">
                    {career.matchedSkills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-t border-slate-800/80 pt-4">
                  <p className="text-xs font-medium text-slate-400">Skills to Close</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    {career.missingSkills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800/80 pt-5">
                <button
                  type="button"
                  disabled={regeneratingRole === career.title}
                  onClick={() => handleSelectCareerRoadmap(career.title)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrentRoadmap
                      ? 'border border-blue-500/40 bg-blue-600/20 text-blue-200 hover:bg-blue-600/30'
                      : 'btn-primary-gradient text-white'
                  }`}
                >
                  {regeneratingRole === career.title ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building 30-Day Roadmap…
                    </>
                  ) : isCurrentRoadmap ? (
                    <>
                      View Active 30-Day Roadmap
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Generate 30-Day Roadmap
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
