import { useState } from 'react';
import { CheckCircle2, Circle, Clock, ExternalLink } from 'lucide-react';
import type { AnalysisRecord } from '../../types/skillxray';

interface RoadmapViewProps {
  analysis: AnalysisRecord | undefined;
  onToggleDay: (analysisId: number, dayNumber: number) => Promise<void>;
  onGoAnalyze: () => void;
}

export function RoadmapView({ analysis, onToggleDay, onGoAnalyze }: RoadmapViewProps) {
  const [weekFilter, setWeekFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [togglingDay, setTogglingDay] = useState<number | null>(null);

  if (!analysis) {
    return (
      <div className="glass-surface-elevated rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">No Learning Roadmap Yet</h1>
        <p className="mt-2 text-sm text-slate-300">
          Run an AI Analysis to generate your personalized 30-day roadmap.
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

  const roadmap = analysis.result.learningRoadmap;
  const completedSet = new Set(analysis.completedDays);
  const progressPct = Math.round((completedSet.size / 30) * 100);

  const visibleDays = roadmap.days.filter(
    (d) => weekFilter === 'all' || d.week === weekFilter
  );

  async function handleToggle(dayNum: number) {
    if (!analysis) return;
    setTogglingDay(dayNum);
    try {
      await onToggleDay(analysis.id, dayNum);
    } finally {
      setTogglingDay(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header & Progress */}
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium text-violet-400">
              Adaptive 30-Day Execution Plan
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white">
              {roadmap.targetCareer} Roadmap
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{roadmap.overview}</p>
          </div>
          <div className="shrink-0 text-left md:text-right">
            <p className="font-mono text-3xl font-bold text-white tabular-nums">
              {completedSet.size}/30
            </p>
            <p className="text-xs text-slate-400 tabular-nums">{progressPct}% completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Weekly Themes */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-800/80 pt-5">
          {roadmap.weeklyThemes.map((theme, idx) => (
            <div key={idx} className="text-xs">
              <p className="font-mono font-semibold text-blue-400">Week {idx + 1}</p>
              <p className="mt-0.5 text-slate-300">{theme.replace(/^Week \d+:\s*/i, '')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Week Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800 w-fit">
        {(['all', 1, 2, 3, 4] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeekFilter(w)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              weekFilter === w
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {w === 'all' ? 'All 30 Days' : `Week ${w}`}
          </button>
        ))}
      </div>

      {/* Daily Roadmap Items */}
      <div className="space-y-4">
        {visibleDays.map((day) => {
          const isDone = completedSet.has(day.day);
          const isBusy = togglingDay === day.day;
          return (
            <div
              key={day.day}
              className={`glass-surface rounded-2xl p-6 transition-colors ${
                isDone ? 'border-emerald-500/35 bg-emerald-950/10' : 'hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggle(day.day)}
                    aria-label={
                      isDone ? `Mark Day ${day.day} incomplete` : `Mark Day ${day.day} complete`
                    }
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-blue-400">
                        Week {day.week}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-violet-300 font-medium">{day.focusSkill}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3.5 w-3.5" />
                        {day.estimatedMinutes} min
                      </span>
                    </div>

                    <h2
                      className={`mt-1.5 font-display text-lg font-semibold ${
                        isDone ? 'text-slate-300 line-through decoration-slate-500' : 'text-white'
                      }`}
                    >
                      {day.title}
                    </h2>

                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Daily Learning Task</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-200">
                          {day.dailyTask}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Practical Exercise</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">
                          {day.practicalExercise}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 pl-10 lg:pl-0">
                  <a
                    href={day.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-blue-500/50 hover:text-white transition-colors whitespace-nowrap"
                  >
                    <span>{day.resourceTitle}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
