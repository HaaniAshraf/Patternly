import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfidenceBadge } from '@/components/patterns/ConfidenceBadge';
import { patternsService } from '@/services/patterns.service';
import { experimentsService } from '@/services/experiments.service';
import type { Pattern, Experiment } from '@/types';

export function PatternDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [relatedExperiments, setRelatedExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([patternsService.get(id), experimentsService.list()])
      .then(([{ pattern }, { experiments }]) => {
        setPattern(pattern);
        setRelatedExperiments(experiments.filter((e) => e.patternId === id));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pattern) {
    return <p className="text-muted-foreground">Pattern not found.</p>;
  }

  const { statistics } = pattern;
  const chartData = [
    { name: statistics.groupALabel, value: statistics.groupAValue },
    { name: statistics.groupBLabel, value: statistics.groupBValue },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/patterns')}>
        <ArrowLeft className="h-4 w-4" /> Back to patterns
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pattern.title}</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">{pattern.summary}</p>
        </div>
        <Button asChild>
          <Link to={`/experiments/new?patternId=${pattern.id}`}>
            <FlaskConical className="h-4 w-4" /> Create experiment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Group comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Underlying data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Confidence" value={<ConfidenceBadge confidence={pattern.confidence} />} />
            <Row label={statistics.groupALabel} value={`${statistics.groupAValue} (${statistics.groupACount} days)`} />
            <Row label={statistics.groupBLabel} value={`${statistics.groupBValue} (${statistics.groupBCount} days)`} />
            <Row label="Difference" value={`${statistics.percentageDifference >= 0 ? '+' : ''}${statistics.percentageDifference}%`} />
            <Row label="Sample size" value={`${statistics.sampleSize} days`} />
          </CardContent>
        </Card>
      </div>

      {pattern.caveats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caveats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pattern.caveats.map((caveat, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                • {caveat}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {relatedExperiments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related experiments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {relatedExperiments.map((exp) => (
              <Link
                key={exp.id}
                to={`/experiments/${exp.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                <span>{exp.title}</span>
                <span className="capitalize text-muted-foreground">{exp.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
