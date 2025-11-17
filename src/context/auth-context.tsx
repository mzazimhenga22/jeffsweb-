'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session, SupabaseClient } from '@supabase/auth-helpers-nextjs';

const AuthContext = createContext<{
  supabase: SupabaseClient;
  session: Session | null;
  logout: () => void;
}>({ 
  supabase: createClientComponentClient() as unknown as SupabaseClient, 
  session: null, 
  logout: () => {}
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

  const logout = () => {
    supabase.auth.signOut();
  };

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

  return (
    <AuthContext.Provider value={{ supabase, session, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
