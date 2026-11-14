import { useState, type FormEvent } from 'react';
import { Check, User } from 'lucide-react';
import type { UserProfile } from '../../types/skillxray';

interface ProfileViewProps {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

const AVATAR_IMAGE = '/src/assets/images/avatar_user_default_1794644491046.jpg';

export function ProfileView({ user, onUserUpdated }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [roleTitle, setRoleTitle] = useState(user.roleTitle);
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [bio, setBio] = useState(user.bio);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, roleTitle, targetRole, bio }),
      });
      const data = (await res.json()) as { user?: UserProfile; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Could not update profile.');
        return;
      }
      onUserUpdated(data.user);
      setSavedMsg('Profile saved.');
    } catch {
      setError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8 flex items-center gap-6">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shrink-0">
          {!avatarFailed ? (
            <img
              src={AVATAR_IMAGE}
              alt={`${user.name} profile portrait`}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <User className="h-8 w-8 text-blue-400" />
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{user.name}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {user.roleTitle} · Target: {user.targetRole}
          </p>
          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-surface rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="font-display text-lg font-semibold text-white">Career Profile Details</h2>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <Check className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prof-name" className="block text-xs font-medium text-slate-300">
              Full Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="prof-role" className="block text-xs font-medium text-slate-300">
              Current Title
            </label>
            <input
              id="prof-role"
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="prof-target" className="block text-xs font-medium text-slate-300">
            Target Career Role
          </label>
          <input
            id="prof-target"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="prof-bio" className="block text-xs font-medium text-slate-300">
            Career Focus Bio
          </label>
          <textarea
            id="prof-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Summarize your engineering interests and career direction…"
            className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
