
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function MyProfilePage() {
    const { toast } = useToast();

    const handleUpdateProfile = () => {
        toast({
            title: "Profile Updated",
            description: "Your personal information has been successfully updated.",
        });
    }

    const handleUpdatePassword = () => {
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name and email address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Alex Johnson" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="alex.j@example.com" />
                    </div>
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
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
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button onClick={handleUpdatePassword}>Update Password</Button>
                </CardContent>
            </Card>
        </div>
    )
}
