import { api } from './api';
import type { Pattern, DailyEntry } from '@/types';

export const patternsService = {
  list: () => api.get<{ patterns: Pattern[] }>('/patterns'),
  get: (id: string) =>
    api.get<{ pattern: Pattern; relatedEntries: Pick<DailyEntry, 'id' | 'date' | 'sleepHours' | 'energy' | 'mood' | 'productivity' | 'exercise'>[] }>(
      `/patterns/${id}`,
    ),
  analyze: () => api.post<{ patterns: Pattern[] }>('/patterns/analyze'),
  dismiss: (id: string) => api.post<{ pattern: Pattern }>(`/patterns/${id}/dismiss`),
};
