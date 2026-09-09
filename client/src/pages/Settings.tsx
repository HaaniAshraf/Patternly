import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usersService } from '@/services/users.service';
import { billingService } from '@/services/billing.service';
import type { BillingStatus } from '@/types';

export function Settings() {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    billingService.status().then(setBilling);
  }, []);

  if (!user) return null;

  async function togglePreference(key: 'dailyReminder' | 'weeklyReport', value: boolean) {
    const { user: updated } = await usersService.updateMe({ notificationPreferences: { [key]: value } });
    setUser(updated);
  }

  async function handleExport() {
    const data = await usersService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patternly-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export downloaded' });
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await usersService.deleteAccount();
      await logout();
      navigate('/');
    } catch {
      toast({ title: 'Could not delete account', variant: 'destructive' });
      setIsDeleting(false);
    }
  }

  async function handleCancelSubscription() {
    try {
      await billingService.cancel();
      const status = await billingService.status();
      setBilling(status);
      toast({ title: 'Subscription cancelled' });
    } catch {
      toast({ title: 'Could not cancel subscription', variant: 'destructive' });
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily reminder</Label>
              <p className="text-xs text-muted-foreground">A nudge to complete your check-in.</p>
            </div>
            <Switch
              checked={user.notificationPreferences.dailyReminder}
              onCheckedChange={(v) => togglePreference('dailyReminder', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly report</Label>
              <p className="text-xs text-muted-foreground">A summary of your week, every week.</p>
            </div>
            <Switch
              checked={user.notificationPreferences.weeklyReport}
              onCheckedChange={(v) => togglePreference('weeklyReport', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current plan</span>
            <Badge variant={billing?.plan === 'pro' ? 'success' : 'secondary'} className="capitalize">
              {billing?.plan ?? user.plan}
            </Badge>
          </div>
          {billing?.plan === 'pro' ? (
            <Button variant="outline" onClick={handleCancelSubscription}>
              Cancel subscription
            </Button>
          ) : (
            <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Your data belongs to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export data
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your check-ins, patterns, experiments, and insights. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
