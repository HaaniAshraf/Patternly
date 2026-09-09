import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PatternCard } from '@/components/patterns/PatternCard';
import { patternsService } from '@/services/patterns.service';
import { useToast } from '@/context/ToastContext';
import { ApiRequestError } from '@/services/api';
import type { Pattern } from '@/types';

export function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[] | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    patternsService.list().then(({ patterns }) => setPatterns(patterns));
  }, []);

  async function handleDismiss(id: string) {
    setDismissingId(id);
    try {
      await patternsService.dismiss(id);
      setPatterns((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      toast({
        title: 'Could not dismiss pattern',
        description: err instanceof ApiRequestError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setDismissingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patterns</h1>
        <p className="mt-1 text-muted-foreground">
          Relationships your own data suggests — never causation, always your evidence.
        </p>
      </div>

      {patterns === null ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No patterns yet"
          description="Complete a few more daily check-ins and we'll start looking for relationships in your data."
          action={
            <Button asChild>
              <Link to="/check-in">Complete today's check-in</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              onTest={() => navigate(`/experiments/new?patternId=${pattern.id}`)}
              onDismiss={() => handleDismiss(pattern.id)}
              isDismissing={dismissingId === pattern.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
