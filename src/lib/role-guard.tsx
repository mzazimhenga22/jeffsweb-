import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import type { User as DbUser } from '@/lib/types';

type Role = DbUser['role'];

export function useRequireRole(allowed: Role[], options?: { redirectTo?: string }) {
  const { session, profile, loadingProfile } = useAuth();
  const redirectTo = options?.redirectTo ?? '/login';

  if (!session && !loadingProfile) {
    redirect(redirectTo);
  }

  const role = profile?.role;

  if (role && !allowed.includes(role)) {
    redirect('/');
  }
}

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  useRequireRole(allowed);
  return <>{children}</>;
}

