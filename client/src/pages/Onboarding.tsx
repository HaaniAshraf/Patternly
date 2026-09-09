import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/Logo';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/services/users.service';
import { useToast } from '@/context/ToastContext';

const GOAL_OPTIONS = ['Productivity', 'Sleep', 'Energy', 'Mood', 'Fitness', 'Learning', 'Habits', 'General wellbeing'];

const CURIOSITY_OPTIONS = [
  'What affects my productivity?',
  'What affects my sleep?',
  'What affects my mood?',
  'When am I most productive?',
  'Which habits actually help me?',
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [curiosities, setCuriosities] = useState<string[]>([]);
  const [customCuriosity, setCustomCuriosity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function finish() {
    const finalCuriosities = customCuriosity.trim() ? [...curiosities, customCuriosity.trim()] : curiosities;
    setIsSubmitting(true);
    try {
      const { user } = await usersService.completeOnboarding({ goals, curiosities: finalCuriosities });
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast({ title: 'Could not save onboarding', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Logo />
          <span className="text-lg font-semibold">Patternly</span>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <StepIndicator step={step} />

            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">What do you want to understand about yourself?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select as many as you like.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      selected={goals.includes(option)}
                      onClick={() => toggle(goals, setGoals, option)}
                    />
                  ))}
                </div>
                <Button className="w-full" disabled={goals.length === 0} onClick={() => setStep(2)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">What are you curious about?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pick any that apply, or write your own.</p>
                </div>
                <div className="flex flex-col gap-2">
                  {CURIOSITY_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      selected={curiosities.includes(option)}
                      onClick={() => toggle(curiosities, setCuriosities, option)}
                      fullWidth
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Or describe something else you're curious about…"
                  value={customCuriosity}
                  onChange={(e) => setCustomCuriosity(e.target.value)}
                  maxLength={200}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={curiosities.length === 0 && !customCuriosity.trim()}
                    onClick={() => setStep(3)}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">You're ready.</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start with a 30-second check-in each day. We'll start looking for patterns as your data grows.
                  </p>
                </div>
                <Button className="w-full" onClick={finish} disabled={isSubmitting}>
                  {isSubmitting ? 'Setting things up…' : 'Go to dashboard'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className={cn('h-1.5 flex-1 rounded-full', s <= step ? 'bg-primary' : 'bg-secondary')} />
      ))}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
  fullWidth,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-3 py-2 text-left text-sm transition-colors',
        fullWidth ? 'w-full' : '',
        selected ? 'border-primary bg-primary/5 font-medium text-primary' : 'border-border hover:bg-accent',
      )}
    >
      {label}
    </button>
  );
}
