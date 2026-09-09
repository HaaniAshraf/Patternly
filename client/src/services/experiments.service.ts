import { api } from './api';
import type { Experiment, MetricField } from '@/types';

export interface CreateExperimentInput {
  title: string;
  hypothesis: string;
  patternId?: string | null;
  baselineDays: 7 | 14;
  experimentDays: 7 | 14 | 21 | 30;
  primaryMetric: MetricField;
  secondaryMetrics?: MetricField[];
}

export const experimentsService = {
  list: () => api.get<{ experiments: Experiment[] }>('/experiments'),
  get: (id: string) => api.get<{ experiment: Experiment }>(`/experiments/${id}`),
  create: (input: CreateExperimentInput) => api.post<{ experiment: Experiment }>('/experiments', input),
  start: (id: string) => api.post<{ experiment: Experiment }>(`/experiments/${id}/start`),
  cancel: (id: string) => api.post<{ experiment: Experiment }>(`/experiments/${id}/cancel`),
  complete: (id: string) => api.post<{ experiment: Experiment }>(`/experiments/${id}/complete`),
};
