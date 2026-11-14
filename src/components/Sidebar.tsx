import {
  Activity,
  Bot,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Map,
  Radar,
  ScanSearch,
  Settings,
  User,
  X,
} from 'lucide-react';

export type WorkspaceTab =
  | 'dashboard'
  | 'analysis'
  | 'xray'
  | 'careers'
  | 'roadmap'
  | 'profile'
  | 'progress'
  | 'mentor'
  | 'settings';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: WorkspaceTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analysis', label: 'AI Analysis', icon: ScanSearch },
  { id: 'xray', label: 'Skill X-Ray', icon: Radar },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'progress', label: 'Progress', icon: Activity },
  { id: 'mentor', label: 'AI Mentor', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navContent = (
    <div className="flex h-full flex-col justify-between bg-[#080D1A] border-r border-slate-800/80 px-4 py-6">
      <div>
        <div className="flex items-center justify-between px-3 pb-6 border-b border-slate-800/80">
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
            SkillX-Ray AI
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Workspace Navigation" className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/18 text-white border border-blue-500/35'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-64 z-50">{navContent}</aside>
        </div>
      )}
    </>
  );
}
