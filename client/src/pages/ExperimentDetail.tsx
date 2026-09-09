import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfidenceBadge } from '@/components/patterns/ConfidenceBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { experimentsService } from '@/services/experiments.service';
import { useToast } from '@/context/ToastContext';
import { ApiRequestError } from '@/services/api';
import type { Experiment } from '@/types';

const METRIC_LABELS: Record<string, string> = {
  productivity: 'Productivity',
  mood: 'Mood',
  energy: 'Energy',
  sleepHours: 'Sleep',
};

export function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  function load() {
    if (!id) return;
    experimentsService.get(id).then(({ experiment }) => setExperiment(experiment));
  }

  useEffect(() => {
    setIsLoading(true);
    if (id) experimentsService.get(id).then(({ experiment }) => setExperiment(experiment)).finally(() => setIsLoading(false));
  }, [id]);

  async function handleComplete() {
    if (!experiment) return;
    setIsActing(true);
    try {
      const { experiment: updated } = await experimentsService.complete(experiment.id);
      setExperiment(updated);
    } catch (err) {
      toast({
        title: 'Could not complete experiment',
        description: err instanceof ApiRequestError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setIsActing(false);
    }
  }

  async function handleCancel() {
    if (!experiment) return;
    setIsActing(true);
    try {
      const { experiment: updated } = await experimentsService.cancel(experiment.id);
      setExperiment(updated);
    } catch {
      toast({ title: 'Could not cancel experiment', variant: 'destructive' });
    } finally {
      setIsActing(false);
      setShowCancelConfirm(false);
    }
  }

  if (isLoading || !experiment) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (experiment.status === 'completed' && experiment.result) {
    return <ExperimentResult experiment={experiment} onRefresh={load} />;
  }

  const metricLabel = METRIC_LABELS[experiment.primaryMetric];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/experiments')}>
        <ArrowLeft className="h-4 w-4" /> Back to experiments
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{experiment.title}</h1>
          <p className="mt-1 text-muted-foreground">{experiment.hypothesis}</p>
        </div>
        <Badge variant={experiment.status === 'cancelled' ? 'secondary' : 'default'} className="capitalize">
          {experiment.status}
        </Badge>
      </div>

      {experiment.status !== 'cancelled' && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">{experiment.progress.phase} period</span>
              <span className="text-muted-foreground">
                Day {experiment.progress.currentDay} / {experiment.progress.totalDays}
              </span>
            </div>
            <Progress value={(experiment.progress.currentDay / Math.max(experiment.progress.totalDays, 1)) * 100} />
            <p className="text-sm text-muted-foreground">
              Tracking <span className="font-medium text-foreground">{metricLabel}</span>. Keep completing your daily
              check-in — that's the only extra step.
            </p>
          </CardContent>
        </Card>
      )}

      {experiment.status !== 'cancelled' && (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/check-in">Go to today's check-in</Link>
          </Button>
          <Button variant="outline" onClick={handleComplete} disabled={isActing}>
            {isActing ? 'Completing…' : 'Complete experiment'}
          </Button>
          <Button variant="ghost" onClick={() => setShowCancelConfirm(true)} disabled={isActing}>
            Cancel experiment
          </Button>
        </div>
      )}
      {experiment.status === 'active' && !experiment.progress.readyToComplete && (
        <p className="text-xs text-muted-foreground">
          You can complete early, but waiting until day {experiment.progress.totalDays} gives a more reliable result.
        </p>
      )}

      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this experiment?</DialogTitle>
            <DialogDescription>You won't get a result, but your check-in data stays intact.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              Keep experiment
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isActing}>
              Cancel experiment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExperimentResult({ experiment }: { experiment: Experiment; onRefresh: () => void }) {
  const result = experiment.result!;
  const isPositive = result.percentageChange >= 0;
  const conclusionHeadline = result.conclusion.split(':')[0] || result.conclusion;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Experiment complete</p>
        <h1 className="mt-1 text-2xl font-semibold">{experiment.title}</h1>
        <p className="mt-2 text-xl font-medium text-primary">{conclusionHeadline}</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-6 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Baseline</p>
            <p className="text-2xl font-semibold">{result.baselineValue}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Experiment</p>
            <p className="text-2xl font-semibold">{result.experimentValue}</p>
          </div>
          <div className="col-span-2 flex items-center justify-center gap-1.5 border-t border-border pt-4">
            {isPositive ? <ArrowUp className="h-4 w-4 text-success" /> : <ArrowDown className="h-4 w-4 text-destructive" />}
            <span className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}
              {result.percentageChange}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What we learned</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{result.conclusion}</p>
          <ConfidenceBadge confidence={result.confidence} />
          {result.caveats.map((caveat, i) => (
            <p key={i} className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Caveat: {caveat}
            </p>
          ))}
        </CardContent>
      </Card>

      {result.nextExperiment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggested next experiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{result.nextExperiment}</p>
            <Button asChild className="w-full">
              <Link to={`/experiments/new?hypothesis=${encodeURIComponent(result.nextExperiment)}`}>
                Start next experiment
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
