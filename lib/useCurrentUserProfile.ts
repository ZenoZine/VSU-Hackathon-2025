'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
};

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile', error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    };

    load();
  }, []);

  return { profile, loading };
}