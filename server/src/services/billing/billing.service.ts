import { User } from '../../models/User';
import { razorpayProvider } from './razorpay.provider';
import type { PaymentProvider } from './paymentProvider.interface';
import { ApiError } from '../../utils/ApiError';

// Single place to swap providers later (e.g. pick Stripe based on env/feature flag).
const activeProvider: PaymentProvider = razorpayProvider;

export async function createUserSubscription(userId: string, planCycle: 'monthly' | 'annual') {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized();

  const result = await activeProvider.createSubscription({
    userId,
    email: user.email,
    name: user.name,
    planCycle,
  });

  user.subscription = {
    provider: result.provider,
    subscriptionId: result.subscriptionId,
    status: 'created',
    currentPeriodEnd: null,
    plan: planCycle,
  };
  await user.save();

  return result;
}

export async function cancelUserSubscription(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized();
  if (!user.subscription?.subscriptionId) {
    throw ApiError.badRequest('No active subscription to cancel', 'NO_ACTIVE_SUBSCRIPTION');
  }

  await activeProvider.cancelSubscription(user.subscription.subscriptionId);
  user.subscription.status = 'cancelled';
  await user.save();
}

const ACTIVE_STATUSES = new Set(['active', 'authenticated']);
const INACTIVE_STATUSES = new Set(['cancelled', 'completed', 'expired', 'halted']);

/**
 * Applying the same webhook event twice results in the same final user state (a plain
 * overwrite of subscription/plan fields), which is what makes this handler idempotent
 * without needing a separate processed-events ledger.
 */
export async function handleWebhook(rawBody: string, signature: string | undefined): Promise<void> {
  if (!activeProvider.verifyWebhookSignature(rawBody, signature)) {
    throw ApiError.unauthorized('Invalid webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
  }

  const event = activeProvider.parseWebhookEvent(rawBody);
  if (!event.subscriptionId) return;

  const user = await User.findOne({ 'subscription.subscriptionId': event.subscriptionId });
  if (!user) return;

  if (event.status) {
    user.subscription.status = event.status;
  }
  if (event.currentPeriodEnd) {
    user.subscription.currentPeriodEnd = event.currentPeriodEnd;
  }

  if (event.status && ACTIVE_STATUSES.has(event.status)) {
    user.plan = 'pro';
  } else if (event.status && INACTIVE_STATUSES.has(event.status)) {
    user.plan = 'free';
  }

  await user.save();
}

export function getBillingStatus(user: { plan: string; subscription: any }) {
  return {
    plan: user.plan,
    subscription: user.subscription,
  };
}
