
'use client';

import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setTimeout(() => setSaving(false), 500); // stubbed save
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage platform identity and support details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="Jeff's Concepts" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@jeffsconcepts.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-phone">Support Phone</Label>
              <Input id="support-phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <Separator />
            <div className="flex items-center justify-between rounded-2xl border border-border/50 p-4">
              <div>
                <p className="font-medium">Operational alerts</p>
                <p className="text-sm text-muted-foreground">Notify admins when payouts fail or vendors need approval.</p>
              </div>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update credentials and enforce strong access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Use 12+ characters" />
          </div>
          <Button>Update Password</Button>
          <p className="text-xs text-muted-foreground">Passwords are stored securely; you&apos;ll be prompted to re-login after changes.</p>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>These actions are irreversible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Removing all platform data will delete users, products, orders, and payouts. Ensure you have backups before proceeding.
          </p>
          <Button variant="destructive">Delete Platform Data</Button>
        </CardContent>
      </Card>
    </div>
  )
}
