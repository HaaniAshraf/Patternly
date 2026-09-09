import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usersService } from '@/services/users.service';

const GOAL_OPTIONS = ['Productivity', 'Sleep', 'Energy', 'Mood', 'Fitness', 'Learning', 'Habits', 'General wellbeing'];

export function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [goals, setGoals] = useState<string[]>(user?.goals ?? []);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  function toggleGoal(goal: string) {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const { user: updated } = await usersService.updateMe({ name, goals });
      setUser(updated);
      toast({ title: 'Profile updated', variant: 'success' });
    } catch {
      toast({ title: 'Could not save profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details and goals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current plan</span>
            <Badge variant={user.plan === 'pro' ? 'success' : 'secondary'} className="capitalize">
              {user.plan}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals</CardTitle>
          <CardDescription>What you want to understand about yourself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                  goals.includes(goal) ? 'border-primary bg-primary/5 font-medium text-primary' : 'border-border hover:bg-accent',
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {user.curiosities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.curiosities.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}
