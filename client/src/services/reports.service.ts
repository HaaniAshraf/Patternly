import { api } from './api';
import type { WeeklyReport } from '@/types';

export const reportsService = {
  weekly: () => api.get<{ report: WeeklyReport }>('/reports/weekly'),
};
