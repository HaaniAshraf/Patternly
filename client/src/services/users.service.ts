import { api } from './api';
import type { User } from '@/types';

export const usersService = {
  updateMe: (input: { name?: string; goals?: string[]; notificationPreferences?: { dailyReminder?: boolean; weeklyReport?: boolean } }) =>
    api.put<{ user: User }>('/users/me', input),
  exportData: () => api.get<Record<string, unknown>>('/users/me/export'),
  deleteAccount: () => api.delete<null>('/users/me'),
  completeOnboarding: (input: { goals: string[]; curiosities: string[] }) =>
    api.post<{ user: User }>('/onboarding', input),
};
