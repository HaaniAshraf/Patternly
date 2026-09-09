import { api } from './api';
import type { User } from '@/types';

export const authService = {
  register: (input: { name: string; email: string; password: string; confirmPassword: string }) =>
    api.post<{ user: User }>('/auth/register', input),
  login: (input: { email: string; password: string }) => api.post<{ user: User }>('/auth/login', input),
  logout: () => api.post<null>('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
};
