export interface CreateSubscriptionParams {
  userId: string;
  email: string;
  name: string;
  planCycle: 'monthly' | 'annual';
}

export interface CreateSubscriptionResult {
  provider: string;
  subscriptionId: string;
  /** Data the frontend needs to open the provider's checkout UI. */
  checkout: Record<string, unknown>;
}

export interface WebhookEvent {
  type: string;
  subscriptionId: string | null;
  status: string | null;
  currentPeriodEnd: Date | null;
}

/**
 * Payment abstraction so the app can add another provider (e.g. Stripe) later without
 * touching controllers or the subscription/feature-limit logic — only this contract
 * and a new implementation file are needed.
 */
export interface PaymentProvider {
  name: string;
  createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean;
  parseWebhookEvent(rawBody: string): WebhookEvent;
}
