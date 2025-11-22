'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      // best-effort sign out
      await supabase.auth.signOut();
      // send them back to login (or "/" if you prefer)
      router.replace('/login');
    };

    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <p className="text-sm text-slate-300">Signing you out…</p>
    </div>
  );
}