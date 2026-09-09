import { Badge } from '@/components/ui/badge';
import type { Confidence } from '@/types';

const LABELS: Record<Confidence, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  insufficient: 'Insufficient',
};

const VARIANTS: Record<Confidence, 'success' | 'default' | 'warning' | 'secondary'> = {
  strong: 'success',
  moderate: 'default',
  weak: 'warning',
  insufficient: 'secondary',
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <Badge variant={VARIANTS[confidence]}>Confidence: {LABELS[confidence]}</Badge>;
}
