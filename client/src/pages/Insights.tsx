import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { insightsService } from '@/services/insights.service';
import type { Insight, Confidence } from '@/types';

const CATEGORIES: { key: Insight['category']; label: string }[] = [
  { key: 'productivity', label: 'Productivity' },
  { key: 'mood', label: 'Mood' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'energy', label: 'Energy' },
];

const CONFIDENCE_DOT: Record<Confidence, string> = {
  strong: '🟢',
  moderate: '🟢',
  weak: '🟡',
  insufficient: '🟡',
};

export function Insights() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    insightsService.list().then(({ insights }) => setInsights(insights));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-muted-foreground">What your data has taught you so far.</p>
      </div>

      {insights === null ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-6 w-6" />}
          title="No insights yet"
          description="As patterns and experiments accumulate, we'll summarize what you've learned about yourself here."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map(({ key, label }) => {
            const items = insights.filter((i) => i.category === key);
            if (items.length === 0) return null;
            return (
              <Card key={key}>
                <CardContent className="space-y-3 pt-6">
                  <h2 className="font-semibold">{label}</h2>
                  {items.map((insight) => (
                    <button
                      key={insight.id}
                      onClick={() => {
                        const patternId = insight.evidence.relatedPatternIds[0];
                        if (patternId) navigate(`/patterns/${patternId}`);
                      }}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-all duration-150 hover:translate-x-0.5 hover:bg-accent"
                    >
                      <span>{CONFIDENCE_DOT[insight.confidence]}</span>
                      <span>{insight.title}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
