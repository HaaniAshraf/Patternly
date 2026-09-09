import { api } from './api';
import type { DailyEntry } from '@/types';

export interface EntryInput {
  date: string;
  sleepHours: number;
  energy: number;
  mood: number;
  productivity: number;
  exercise: boolean;
  note?: string;
}

export const entriesService = {
  list: () => api.get<{ entries: DailyEntry[] }>('/entries'),
  today: (date: string) => api.get<{ entry: DailyEntry | null }>(`/entries/today?date=${date}`),
  get: (id: string) => api.get<{ entry: DailyEntry }>(`/entries/${id}`),
  create: (input: EntryInput) => api.post<{ entry: DailyEntry }>('/entries', input),
  update: (id: string, input: Partial<EntryInput>) => api.put<{ entry: DailyEntry }>(`/entries/${id}`, input),
  remove: (id: string) => api.delete<null>(`/entries/${id}`),
};
