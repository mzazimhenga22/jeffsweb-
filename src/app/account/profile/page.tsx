
'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type ProfileRow = {
    id: string;
    full_name?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
};

export default function MyProfilePage() {
    const { toast } = useToast();
    const { supabase, user, profile, refreshProfile, loadingProfile } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const userId = useMemo(() => (user as any)?.id ?? null, [user]);

    const resolvedRole = useMemo(() => {
        return (role ??
            (profile as any)?.role ??
            (user as any)?.role ??
            (user as any)?.user_metadata?.role ??
            (user as any)?.app_metadata?.role) as string | null;
    }, [role, profile, user]);

    const isCustomer = resolvedRole === 'customer' || !resolvedRole;

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const loadProfile = async () => {
            setIsLoading(true);

            // Seed with any already-known profile data to avoid empty fields while loading.
            const seed = (profile as ProfileRow) ?? null;
            if (seed) {
                setFullName(seed.full_name ?? seed.name ?? '');
                setEmail(seed.email ?? '');
                setPhone(seed.phone ?? '');
                setRole(seed.role ?? null);
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                const message = error.message || 'Unable to load your profile right now.';
                console.error('Failed to load profile', error);
                toast({
                    title: 'Unable to load profile',
                    description: message,
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            if (!isMounted) return;

            const details = (data as ProfileRow) ?? null;
            const fallbackMeta = (user as any)?.user_metadata ?? {};
            setFullName(
                details?.full_name ??
                details?.name ??
                seed?.full_name ??
                seed?.name ??
                fallbackMeta.full_name ??
                fallbackMeta.name ??
                ''
            );
            setEmail(details?.email ?? seed?.email ?? fallbackMeta.email ?? '');
            setPhone(details?.phone ?? seed?.phone ?? fallbackMeta.phone ?? '');
            setRole(details?.role ?? seed?.role ?? fallbackMeta.role ?? null);
            setIsLoading(false);
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [profile, supabase, toast, userId]);

    const handleUpdateProfile = async () => {
        if (!userId) {
            toast({
                title: 'You need to be logged in',
                description: 'Sign in to update your profile.',
                variant: 'destructive',
            });
            return;
        }

        setIsSavingProfile(true);

        const updates = {
            full_name: fullName || null,
            name: fullName || null,
            email: email || null,
            phone: phone || null,
        };

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('Failed to update profile', error);
            toast({
                title: 'Profile update failed',
                description: error.message,
                variant: 'destructive',
            });
            setIsSavingProfile(false);
            return;
        }

        const { error: authError } = await supabase.auth.updateUser({ email });

        if (authError) {
            console.warn('Profile updated, but auth email change failed', authError);
            toast({
                title: 'Profile updated, email needs confirmation',
                description: authError.message,
            });
        } else {
            toast({
                title: 'Profile Updated',
                description: 'Your personal information has been successfully updated.',
            });
        }

        await refreshProfile();
        setIsSavingProfile(false);
    };

    const handleUpdatePassword = async () => {
        if (!userId) {
            toast({
                title: 'You need to be logged in',
                description: 'Sign in to update your password.',
                variant: 'destructive',
            });
            return;
        }

        if (!newPassword) {
            toast({
                title: 'New password required',
                description: 'Enter a new password to continue.',
                variant: 'destructive',
            });
            return;
        }

        setIsSavingPassword(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Failed to update password', error);
            toast({
                title: 'Password update failed',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });
            setCurrentPassword('');
            setNewPassword('');
        }

        setIsSavingPassword(false);
    };

    const loading = isLoading || loadingProfile;
    const formDisabled = loading || !isCustomer;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        {isCustomer
                            ? 'Update your name, email, and contact details.'
                            : 'Profile editing is available for customer accounts.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading your profile...</p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={formDisabled || isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={loading || isSavingPassword}>
                        {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
