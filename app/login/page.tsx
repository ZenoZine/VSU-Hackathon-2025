'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/me/tasks');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-900">
          ClinicOps Login
        </h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm mb-1 text-gray-700">Email</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">Password</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
