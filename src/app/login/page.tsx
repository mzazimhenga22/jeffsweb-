'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/lib/database.types';

type UserRole = Database['public']['Tables']['users']['Row']['role']

const normalizeRoles = (value?: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean)
  return []
}

function resolveDashboardPath({
  profileRole,
  metadataRole,
  isAdminFlag,
}: {
  profileRole?: UserRole | null;
  metadataRole?: string | string[];
  isAdminFlag?: boolean;
}): string {
  const roles = new Set<string>([...normalizeRoles(profileRole), ...normalizeRoles(metadataRole)]);
  if (isAdminFlag || roles.has('admin')) return '/admin';
  if (roles.has('vendor')) return '/vendor';
  if (roles.has('salesperson')) return '/salesperson';
  return '/';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      const authUser = data.user ?? null;
      let profileRole: UserRole | null = null;

      if (authUser?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Failed to load profile for redirect', profileError);
        } else {
          profileRole = profile?.role ?? null;
        }
      }

      const metadataRole = authUser?.user_metadata?.role;
      const isAdminFlag =
        authUser?.user_metadata?.is_admin === true ||
        normalizeRoles(metadataRole).includes('admin');

      const destination = resolveDashboardPath({
        profileRole,
        metadataRole,
        isAdminFlag,
      });

      router.push(destination);
      router.refresh();
    }
  };

  return (
    <MainLayout>
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && <p className="text-red-500">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6">
                Login
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
