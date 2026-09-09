import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { patternsService } from '@/services/patterns.service';
import { experimentsService } from '@/services/experiments.service';
import { ApiRequestError } from '@/services/api';
import type { MetricField } from '@/types';

const METRICS: { value: MetricField; label: string }[] = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'mood', label: 'Mood' },
  { value: 'energy', label: 'Energy' },
  { value: 'sleepHours', label: 'Sleep' },
];

export function ExperimentNew() {
  const [searchParams] = useSearchParams();
  const patternId = searchParams.get('patternId');
  const prefilledHypothesis = searchParams.get('hypothesis');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState(prefilledHypothesis ?? '');
  const [baselineDays, setBaselineDays] = useState<7 | 14>(7);
  const [experimentDays, setExperimentDays] = useState<7 | 14 | 21 | 30>(14);
  const [primaryMetric, setPrimaryMetric] = useState<MetricField>('productivity');
  const [secondaryMetrics, setSecondaryMetrics] = useState<MetricField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPro = user?.plan === 'pro';
  const experimentDayOptions: Array<7 | 14 | 21 | 30> = isPro ? [7, 14, 21, 30] : [7, 14];

  useEffect(() => {
    if (!patternId) return;
    patternsService.get(patternId).then(({ pattern }) => {
      setTitle(`${capitalize(pattern.variableA)} → ${capitalize(pattern.variableB)}`);
      setHypothesis(pattern.suggestedExperiment || `Testing whether ${pattern.variableA} affects my ${pattern.variableB}.`);
      if (pattern.variableB === 'productivity' || pattern.variableB === 'mood' || pattern.variableB === 'energy') {
        setPrimaryMetric(pattern.variableB);
      }
    });
  }, [patternId]);

  function toggleSecondary(metric: MetricField) {
    setSecondaryMetrics((prev) => (prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const { experiment } = await experimentsService.create({
        title,
        hypothesis,
        patternId,
        baselineDays,
        experimentDays,
        primaryMetric,
        secondaryMetrics: secondaryMetrics.filter((m) => m !== primaryMetric),
      });
      await experimentsService.start(experiment.id);
      toast({ title: 'Experiment started', description: 'Your baseline period has begun.', variant: 'success' });
      navigate(`/experiments/${experiment.id}`);
    } catch (err) {
      toast({
        title: 'Could not create experiment',
        description: err instanceof ApiRequestError ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New experiment</h1>
        <p className="mt-1 text-muted-foreground">
          {patternId ? 'Starting from a detected pattern.' : 'Start from a custom hypothesis.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experiment details</CardTitle>
          <CardDescription>You can edit any of this before starting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exercise → Productivity" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Textarea
              id="hypothesis"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Exercising before work improves my productivity."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Baseline period</Label>
            <div className="flex gap-2">
              {[7, 14].map((days) => (
                <SelectPill key={days} selected={baselineDays === days} onClick={() => setBaselineDays(days as 7 | 14)}>
                  {days} days
                </SelectPill>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Experiment period</Label>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 21, 30].map((days) => {
                const allowed = experimentDayOptions.includes(days as 7 | 14 | 21 | 30);
                return (
                  <SelectPill
                    key={days}
                    selected={experimentDays === days}
                    disabled={!allowed}
                    onClick={() => allowed && setExperimentDays(days as 7 | 14 | 21 | 30)}
                  >
                    {days} days {!allowed && '(Pro)'}
                  </SelectPill>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Primary metric</Label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map((m) => (
                <SelectPill key={m.value} selected={primaryMetric === m.value} onClick={() => setPrimaryMetric(m.value)}>
                  {m.label}
                </SelectPill>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Secondary metrics (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {METRICS.filter((m) => m.value !== primaryMetric).map((m) => (
                <SelectPill key={m.value} selected={secondaryMetrics.includes(m.value)} onClick={() => toggleSecondary(m.value)}>
                  {m.label}
                </SelectPill>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting || !title || !hypothesis}>
            {isSubmitting ? 'Starting…' : 'Start experiment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SelectPill({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-primary bg-primary/5 font-medium text-primary' : 'border-border hover:bg-accent',
      )}
    >
      {children}
    </button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
