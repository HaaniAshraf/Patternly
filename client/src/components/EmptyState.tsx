import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
