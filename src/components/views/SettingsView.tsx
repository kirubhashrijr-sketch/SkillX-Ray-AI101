import { Download, LogOut } from 'lucide-react';
import type { AnalysisRecord, UserProfile } from '../../types/skillxray';

interface SettingsViewProps {
  user: UserProfile;
  activeAnalysis: AnalysisRecord | undefined;
  onLogout: () => void;
}

export function SettingsView({ user, activeAnalysis, onLogout }: SettingsViewProps) {
  function handleExportJson() {
    if (!activeAnalysis) return;
    const blob = new Blob([JSON.stringify(activeAnalysis, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillxray-report-${activeAnalysis.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold text-white">Workspace Settings</h1>
        <p className="mt-1 text-sm text-slate-300">
          Manage your SkillX-Ray AI account preferences and export portable reports.
        </p>
      </div>

      <div className="glass-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Account & Security</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-slate-400">Signed-in Email</p>
            <p className="mt-1 text-slate-100">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Member Since</p>
            <p className="mt-1 text-slate-100 tabular-nums">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-surface rounded-2xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-white">
            Export Active Skill X-Ray Report
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Download structured JSON containing resume analysis, hidden skills, matches, and 30-day
            roadmap.
          </p>
        </div>
        <button
          type="button"
          disabled={!activeAnalysis}
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-xs font-medium text-white hover:border-blue-500/50 disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4 text-blue-400" />
          Download JSON Report
        </button>
      </div>

      <div className="glass-surface rounded-2xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-white">Session Sign Out</h2>
          <p className="mt-1 text-xs text-slate-400">
            Clear your encrypted session cookie and return to the landing page.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-200 hover:bg-red-500/20 cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
