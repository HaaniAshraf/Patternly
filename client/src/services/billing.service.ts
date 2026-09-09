import { api } from './api';
import type { BillingStatus } from '@/types';

export const billingService = {
  status: () => api.get<BillingStatus>('/billing/status'),
  createSubscription: (planCycle: 'monthly' | 'annual') =>
    api.post<{ provider: string; subscriptionId: string; checkout: Record<string, unknown> }>(
      '/billing/create-subscription',
      { planCycle },
    ),
  cancel: () => api.post<null>('/billing/cancel'),
};
