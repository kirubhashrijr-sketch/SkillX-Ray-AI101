import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import type { UserProfile } from '../types/skillxray';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onBack: () => void;
  onSuccess: (user: UserProfile) => void;
}

export function AuthPage({ initialMode, onBack, onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('AI Product Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password, targetRole: targetRole.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { user?: UserProfile; error?: string };

      if (!res.ok || !data.user) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('Network error while connecting to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemoCredentials() {
    setMode('login');
    setEmail('alex.rivera@skillxray.ai');
    setPassword('SkillXRay2026!');
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100 flex flex-col justify-between px-6 py-8">
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <span className="font-display text-base font-bold text-white">SkillX-Ray AI</span>
      </div>

      <div className="mx-auto my-10 w-full max-w-md">
        <div className="glass-surface-elevated rounded-2xl p-8">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {mode === 'login'
                ? 'Sign in to view your Skill X-Ray, career matches, and 30-day roadmap.'
                : 'Start uncovering hidden skills and mapping your target tech role.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300">
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Taylor"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-target" className="block text-xs font-medium text-slate-300">
                  Target Career Role
                </label>
                <input
                  id="auth-target"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., AI Product Engineer"
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-gradient mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? mode === 'login'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 py-2.5 text-xs font-medium text-slate-300 hover:border-blue-500/60 hover:text-white transition-colors cursor-pointer"
            >
              Fill Sample Account (Alex Rivera — Preloaded Skill X-Ray)
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Passwords are hashed with bcrypt and stored in encrypted session cookies.
      </p>
    </div>
  );
}
