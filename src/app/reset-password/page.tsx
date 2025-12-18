'use client';

import * as React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sessionReady, setSessionReady] = React.useState(false);

  React.useEffect(() => {
    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: 'Link expired or invalid',
          description: 'Please request a new password reset link.',
          variant: 'destructive',
        });
      } else {
        setSessionReady(true);
      }
    };

    ensureSession();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sessionReady) return;

    if (!password || password !== confirmPassword) {
      toast({
        title: 'Passwords must match',
        description: 'Enter the same password twice to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: 'Could not update password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'You can now log in with your new password.',
      });
      router.push('/login');
    }

    setIsSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Set a new password</CardTitle>
            <CardDescription>
              Enter and confirm your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!sessionReady || isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!sessionReady || isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={!sessionReady || isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update password'}
              </Button>
              {!sessionReady && (
                <p className="text-sm text-muted-foreground">
                  We&apos;re validating your reset link. If this takes long, request a new one.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
