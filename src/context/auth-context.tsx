'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { User as DbUser } from '@/lib/types';

type AuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  /**
   * The user row from your `users` table, if it exists.
   */
  profile: DbUser | null;
  /**
   * Convenience field that exposes either the profile row (preferred) or the
   * Supabase auth user so callers don't have to juggle both.
   */
  user: DbUser | Session['user'] | null;
  loadingProfile: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  supabase: createClientComponentClient() as unknown as SupabaseClient,
  session: null,
  profile: null,
  user: null,
  loadingProfile: false,
  refreshProfile: async () => {},
  logout: () => {},
});

export const AuthProvider = ({
  session: serverSession,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) => {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(serverSession);
   const [profile, setProfile] = useState<DbUser | null>(null);
   const [loadingProfile, setLoadingProfile] = useState(false);

  const logout = () => {
    supabase.auth.signOut();
  };

  const refreshProfile = useCallback(async () => {
    const authUserId = session?.user?.id;
    if (!authUserId) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load user profile', error);
      setProfile(null);
    } else {
      const row = data as DbUser;
      setProfile(row ?? null);
    }
    setLoadingProfile(false);
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      session,
      profile,
      user: profile ?? session?.user ?? null,
      loadingProfile,
      refreshProfile,
      logout,
    }),
    [loadingProfile, logout, profile, refreshProfile, session, supabase],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
