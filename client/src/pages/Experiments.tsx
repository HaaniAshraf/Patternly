import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { experimentsService } from '@/services/experiments.service';
import type { Experiment } from '@/types';

export function Experiments() {
  const [experiments, setExperiments] = useState<Experiment[] | null>(null);

  useEffect(() => {
    experimentsService.list().then(({ experiments }) => setExperiments(experiments));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
          <p className="mt-1 text-muted-foreground">Turn what you've discovered into a real test.</p>
        </div>
        <Button asChild>
          <Link to="/experiments/new">
            <Plus className="h-4 w-4" /> New experiment
          </Link>
        </Button>
      </div>

      {experiments === null ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : experiments.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-6 w-6" />}
          title="No experiments yet"
          description="Once you find a pattern, turn it into a personal experiment to see if it really holds up."
          action={
            <Button asChild>
              <Link to="/experiments/new">Start an experiment</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <ExperimentSection title="Active" experiments={experiments.filter((e) => e.status === 'baseline' || e.status === 'active')} />
          <ExperimentSection title="Upcoming" experiments={experiments.filter((e) => e.status === 'draft')} />
          <ExperimentSection
            title="Completed"
            experiments={experiments.filter((e) => e.status === 'completed' || e.status === 'cancelled')}
          />
        </div>
      )}
    </div>
  );
}

function ExperimentSection({ title, experiments }: { title: string; experiments: Experiment[] }) {
  if (experiments.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-3">
        {experiments.map((exp) => (
          <Link key={exp.id} to={`/experiments/${exp.id}`}>
            <Card className="hover-lift">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{exp.title}</p>
                  <p className="text-sm text-muted-foreground">{exp.hypothesis}</p>
                </div>
                <div className="flex items-center gap-3">
                  {(exp.status === 'baseline' || exp.status === 'active') && (
                    <div className="w-32">
                      <Progress value={(exp.progress.currentDay / Math.max(exp.progress.totalDays, 1)) * 100} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Day {exp.progress.currentDay}/{exp.progress.totalDays}
                      </p>
                    </div>
                  )}
                  <Badge variant={exp.status === 'completed' ? 'success' : 'secondary'} className="capitalize">
                    {exp.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
