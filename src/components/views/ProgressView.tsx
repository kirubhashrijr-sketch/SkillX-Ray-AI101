import { Trash2 } from 'lucide-react';
import type { AnalysisRecord } from '../../types/skillxray';
import { WeeklyProgressBarChart } from '../ChartWidgets';

interface ProgressViewProps {
  analyses: AnalysisRecord[];
  activeAnalysis: AnalysisRecord | undefined;
  onSelectAnalysis: (id: number) => void;
  onDeleteAnalysis: (id: number) => Promise<void>;
  onGoRoadmap: () => void;
}

export function ProgressView({
  analyses,
  activeAnalysis,
  onSelectAnalysis,
  onDeleteAnalysis,
  onGoRoadmap,
}: ProgressViewProps) {
  const completedDays = activeAnalysis?.completedDays ?? [];
  const totalMinutes = activeAnalysis
    ? activeAnalysis.result.learningRoadmap.days
        .filter((d) => completedDays.includes(d.day))
        .reduce((acc, d) => acc + d.estimatedMinutes, 0)
    : 0;

  return (
    <div className="space-y-8">
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-400">Learning & Assessment History</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">
            Progress & Saved Scans
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Track weekly roadmap execution and compare previous Skill X-Ray scans.
          </p>
        </div>
        {activeAnalysis && (
          <button
            type="button"
            onClick={onGoRoadmap}
            className="btn-primary-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Continue Roadmap
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Roadmap Days Completed</p>
          <p className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
            {completedDays.length} / 30
          </p>
          <p className="mt-1 text-xs text-slate-400">Active target career sprint</p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Invested Study Time</p>
          <p className="mt-2 font-mono text-3xl font-bold text-blue-400 tabular-nums">
            {(totalMinutes / 60).toFixed(1)} hrs
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">{totalMinutes} minutes logged</p>
        </div>
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-400">Saved Skill X-Ray Scans</p>
          <p className="mt-2 font-mono text-3xl font-bold text-violet-400 tabular-nums">
            {analyses.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Stored in SQLite workspace</p>
        </div>
      </div>

      {/* Weekly Completion Bar Chart */}
      {activeAnalysis && (
        <div className="glass-surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Weekly Roadmap Velocity ({activeAnalysis.result.learningRoadmap.targetCareer})
          </h2>
          <p className="text-xs text-slate-400">Completed vs. remaining daily modules per week</p>
          <div className="mt-6 h-[290px]">
            <WeeklyProgressBarChart completedDays={completedDays} />
          </div>
        </div>
      )}

      {/* Saved Analyses History */}
      <div className="glass-surface rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-white">Saved Skill X-Ray Scans</h2>
        <div className="mt-4 divide-y divide-slate-800/80">
          {analyses.map((item) => {
            const isActive = activeAnalysis?.id === item.id;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(item.id)}
                      className="font-display text-base font-semibold text-white hover:text-blue-400 transition-colors text-left cursor-pointer"
                    >
                      {item.title}
                    </button>
                    {isActive && (
                      <span className="text-xs font-medium text-blue-400">Active</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 tabular-nums">
                    <span>{item.targetRole}</span>
                    <span aria-hidden="true">·</span>
                    <span>Readiness {item.result.skillGap.readinessScore}%</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.completedDays.length}/30 days done</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(item.id)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-500/50 hover:text-white cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteAnalysis(item.id)}
                    aria-label={`Delete ${item.title}`}
                    className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-red-500/40 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {analyses.length === 0 && (
            <p className="py-6 text-sm text-slate-400">
              No saved scans yet. Run an AI Analysis to begin tracking progress.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
