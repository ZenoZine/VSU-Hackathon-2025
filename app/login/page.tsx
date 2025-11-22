'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Sign in with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push('/me/tasks');
      return;
    }

    // Look up their profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      router.push('/me/tasks');
      return;
    }

    if (profile.role === 'admin') {
      router.push('/admin/tasks');
    } else {
      router.push('/me/tasks');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / title area */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300">
            Valdosta Medicine · Staff &amp; Admin Login
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-7 shadow-xl shadow-slate-950/60">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-slate-400 text-center mb-6">
            Use your clinic email to access your tasks and admin tools.
          </p>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-200">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@clinic.example"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-200">
                  Password
                </label>
                <span className="text-[10px] text-slate-500">
                  Admins and staff share the same sign-in screen.
                </span>
              </div>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing you in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-500 text-center">
            Once signed in, admins are routed to task management and staff are
            taken directly to their personal queue.
          </p>
        </div>

        {/* Back to home link */}
        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            ← Back to Valdosta Medicine home
          </a>
        </div>
      </div>
    </div>
  );
}