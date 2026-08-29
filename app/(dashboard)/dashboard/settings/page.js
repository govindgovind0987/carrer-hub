'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { User, Shield, Bell, Lock, Eye, Save, KeyRound, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'CANDIDATE';

  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Account settings saved successfully!');
    }, 600);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Security settings and password updated successfully!');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account credentials, privacy parameters, notifications, and security preferences.
          </p>
        </div>
        <Badge variant="outline" className="text-xs uppercase font-bold border-violet-500/30 text-violet-600">
          Role: {userRole}
        </Badge>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Tab 1: Account Settings */}
        <TabsContent value="account" className="space-y-6 pt-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-violet-600" /> General Account Information
              </CardTitle>
              <CardDescription>Update your display name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
                </div>

                <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Save className="mr-2 h-4 w-4" /> Save Account Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security Settings */}
        <TabsContent value="security" className="space-y-6 pt-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-violet-600" /> Update Password & Authentication
              </CardTitle>
              <CardDescription>Keep your password secure with complex credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currPass">Current Password</Label>
                  <Input
                    id="currPass"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPass">New Password</Label>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Lock className="mr-2 h-4 w-4" /> Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Notification Preferences */}
        <TabsContent value="notifications" className="space-y-6 pt-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-violet-600" /> Notification Alert Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <h4 className="font-semibold text-sm">Transactional Email Alerts</h4>
                  <p className="text-xs text-muted-foreground">Receive application updates, ATS score reports, and interview invitations.</p>
                </div>
                <Button variant={emailNotifications ? 'default' : 'outline'} size="sm" onClick={() => setEmailNotifications(!emailNotifications)}>
                  {emailNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <h4 className="font-semibold text-sm">AI Interview Reminders</h4>
                  <p className="text-xs text-muted-foreground">Receive upcoming mock interview countdown alerts 15 minutes before start.</p>
                </div>
                <Button variant={interviewReminders ? 'default' : 'outline'} size="sm" onClick={() => setInterviewReminders(!interviewReminders)}>
                  {interviewReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6 pt-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-violet-600" /> Candidate Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <h4 className="font-semibold text-sm">Public Candidate Directory Listing</h4>
                  <p className="text-xs text-muted-foreground">Allow verified recruiters to discover your profile and match score.</p>
                </div>
                <Button variant={isPublicProfile ? 'default' : 'outline'} size="sm" onClick={() => setIsPublicProfile(!isPublicProfile)}>
                  {isPublicProfile ? 'Public' : 'Private'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
