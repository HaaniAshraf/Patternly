import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './ConfidenceBadge';
import type { Pattern } from '@/types';

export function PatternCard({
  pattern,
  onTest,
  onDismiss,
  isDismissing,
}: {
  pattern: Pattern;
  onTest?: () => void;
  onDismiss?: () => void;
  isDismissing?: boolean;
}) {
  const { statistics } = pattern;
  return (
    <Card className="hover-lift animate-slide-up">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Pattern found</span>
        </div>
        <CardTitle>{pattern.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90">{pattern.summary}</p>
        <p className="text-xs text-muted-foreground">
          Based on {statistics.sampleSize} comparable days ({statistics.groupACount} {statistics.groupALabel.toLowerCase()},{' '}
          {statistics.groupBCount} {statistics.groupBLabel.toLowerCase()}).
        </p>
        {pattern.caveats[0] && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Caveat: {pattern.caveats[0]}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <ConfidenceBadge confidence={pattern.confidence} />
          <div className="flex gap-2">
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} disabled={isDismissing}>
                Dismiss
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to={`/patterns/${pattern.id}`}>View details</Link>
            </Button>
            {onTest && (
              <Button size="sm" onClick={onTest}>
                Test this
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
