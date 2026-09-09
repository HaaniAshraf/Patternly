import { api } from './api';
import type { Insight } from '@/types';

export const insightsService = {
  list: () => api.get<{ insights: Insight[] }>('/insights'),
  get: (id: string) => api.get<{ insight: Insight }>(`/insights/${id}`),
};
