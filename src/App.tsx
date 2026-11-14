import { useEffect, useState } from 'react';
import { Loader2, Menu } from 'lucide-react';
import type { AnalysisRecord, UserProfile } from './types/skillxray';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Sidebar, type WorkspaceTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { AnalysisView } from './components/views/AnalysisView';
import { SkillXRayView } from './components/views/SkillXRayView';
import { CareersView } from './components/views/CareersView';
import { RoadmapView } from './components/views/RoadmapView';
import { ProfileView } from './components/views/ProfileView';
import { ProgressView } from './components/views/ProgressView';
import { MentorView } from './components/views/MentorView';
import { SettingsView } from './components/views/SettingsView';

const TAB_TITLES: Record<WorkspaceTab, string> = {
  dashboard: 'Dashboard',
  analysis: 'AI Analysis',
  xray: 'Skill X-Ray',
  careers: 'Careers',
  roadmap: '30-Day Roadmap',
  profile: 'Profile',
  progress: 'Progress',
  mentor: 'AI Mentor',
  settings: 'Settings',
};

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState<number | null>(null);

  async function loadUserAnalyses() {
    try {
      const res = await fetch('/api/analyses');
      if (!res.ok) return;
      const data = (await res.json()) as { analyses?: AnalysisRecord[] };
      const list = data.analyses ?? [];
      setAnalyses(list);
      if (list.length > 0) {
        setActiveAnalysisId((prev) =>
          prev && list.some((a) => a.id === prev) ? prev : list[0].id
        );
      } else {
        setActiveAnalysisId(null);
      }
    } catch {
      // ignore transient error
    }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(async (data: { user?: UserProfile | null }) => {
        if (data.user) {
          setUser(data.user);
          await loadUserAnalyses();
        }
      })
      .finally(() => setBooting(false));
  }, []);

  async function handleAuthSuccess(loggedInUser: UserProfile) {
    setUser(loggedInUser);
    setActiveTab('dashboard');
    await loadUserAnalyses();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setAnalyses([]);
    setActiveAnalysisId(null);
    setAuthScreen('landing');
  }

  function handleAnalysisCreated(created: AnalysisRecord) {
    setAnalyses((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
    setActiveAnalysisId(created.id);
  }

  function handleAnalysisUpdated(updated: AnalysisRecord) {
    setAnalyses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleDeleteAnalysis(id: number) {
    const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setAnalyses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (activeAnalysisId === id) {
        setActiveAnalysisId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  async function handleToggleRoadmapDay(analysisId: number, dayNumber: number) {
    const res = await fetch('/api/roadmap/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId, dayNumber }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { completedDays: number[] };
    setAnalyses((prev) =>
      prev.map((a) => (a.id === analysisId ? { ...a, completedDays: data.completedDays } : a))
    );
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-[#060A14] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span>Loading SkillX-Ray AI…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'login' || authScreen === 'signup') {
      return (
        <AuthPage
          initialMode={authScreen}
          onBack={() => setAuthScreen('landing')}
          onSuccess={handleAuthSuccess}
        />
      );
    }
    return <LandingPage onNavigateAuth={(mode) => setAuthScreen(mode)} />;
  }

  const activeAnalysis = analyses.find((a) => a.id === activeAnalysisId) ?? analyses[0];

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-64 flex min-h-screen flex-col">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#060A14]/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden rounded-lg border border-slate-800 p-2 text-slate-300 hover:text-white cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-sm">
                <span className="text-slate-400">Workspace</span>
                <span className="mx-2 text-slate-600">/</span>
                <span className="font-medium text-white">{TAB_TITLES[activeTab]}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {analyses.length > 1 && (
                <select
                  aria-label="Select active Skill X-Ray scan"
                  value={activeAnalysis?.id ?? ''}
                  onChange={(e) => setActiveAnalysisId(Number(e.target.value))}
                  className="hidden sm:block max-w-[220px] truncate rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                {user.name}
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                analysis={activeAnalysis}
                analysesCount={analyses.length}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'analysis' && (
              <AnalysisView
                activeAnalysis={activeAnalysis}
                onAnalysisCreated={handleAnalysisCreated}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'xray' && (
              <SkillXRayView
                analysis={activeAnalysis}
                onGoAnalyze={() => setActiveTab('analysis')}
              />
            )}
            {activeTab === 'careers' && (
              <CareersView
                analysis={activeAnalysis}
                onAnalysisUpdated={handleAnalysisUpdated}
                onGoRoadmap={() => setActiveTab('roadmap')}
                onGoAnalyze={() => setActiveTab('analysis')}
              />
            )}
            {activeTab === 'roadmap' && (
              <RoadmapView
                analysis={activeAnalysis}
                onToggleDay={handleToggleRoadmapDay}
                onGoAnalyze={() => setActiveTab('analysis')}
              />
            )}
            {activeTab === 'progress' && (
              <ProgressView
                analyses={analyses}
                activeAnalysis={activeAnalysis}
                onSelectAnalysis={(id) => setActiveAnalysisId(id)}
                onDeleteAnalysis={handleDeleteAnalysis}
                onGoRoadmap={() => setActiveTab('roadmap')}
              />
            )}
            {activeTab === 'mentor' && <MentorView activeAnalysis={activeAnalysis} />}
            {activeTab === 'profile' && (
              <ProfileView user={user} onUserUpdated={setUser} />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                activeAnalysis={activeAnalysis}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
