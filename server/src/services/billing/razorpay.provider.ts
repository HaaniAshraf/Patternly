import crypto from 'crypto';
import { env } from '../../config/env';
import type {
  CreateSubscriptionParams,
  CreateSubscriptionResult,
  PaymentProvider,
  WebhookEvent,
} from './paymentProvider.interface';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

// Created ahead of time in the Razorpay dashboard; referenced here rather than
// hardcoded amounts so pricing changes don't require a deploy.
const PLAN_IDS: Record<'monthly' | 'annual', string | undefined> = {
  monthly: process.env.RAZORPAY_PLAN_ID_MONTHLY,
  annual: process.env.RAZORPAY_PLAN_ID_ANNUAL,
};

function authHeader(): string {
  const token = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64');
  return `Basic ${token}`;
}

export const razorpayProvider: PaymentProvider = {
  name: 'razorpay',

  async createSubscription({ planCycle, email, name }: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
    const planId = PLAN_IDS[planCycle];
    if (!env.razorpayKeyId || !env.razorpayKeySecret || !planId) {
      throw new Error('Razorpay is not fully configured (missing keys or plan ID)');
    }

    const response = await fetch(`${RAZORPAY_API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: authHeader() },
      body: JSON.stringify({
        plan_id: planId,
        customer_notify: 1,
        total_count: planCycle === 'monthly' ? 12 : 1,
        notes: { email, name },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Razorpay subscription creation failed: ${response.status} ${body}`);
    }

    const data = (await response.json()) as { id: string };
    return {
      provider: 'razorpay',
      subscriptionId: data.id,
      checkout: {
        key: env.razorpayKeyId,
        subscription_id: data.id,
        name: 'Patternly Pro',
      },
    };
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${RAZORPAY_API_BASE}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: authHeader() },
      body: JSON.stringify({ cancel_at_cycle_end: 0 }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Razorpay subscription cancellation failed: ${response.status} ${body}`);
    }
  },

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    if (!signature || !env.razorpayWebhookSecret) return false;
    const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  },

  parseWebhookEvent(rawBody: string): WebhookEvent {
    const payload = JSON.parse(rawBody);
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    return {
      type: payload.event,
      subscriptionId: subscriptionEntity?.id ?? null,
      status: subscriptionEntity?.status ?? null,
      currentPeriodEnd: subscriptionEntity?.current_end ? new Date(subscriptionEntity.current_end * 1000) : null,
    };
  },
};
