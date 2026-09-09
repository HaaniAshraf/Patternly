import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { createUserSubscription, cancelUserSubscription, getBillingStatus, handleWebhook } from '../services/billing/billing.service';

export const createSubscriptionSchema = z.object({
  planCycle: z.enum(['monthly', 'annual']),
});

export const getBillingStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();
  res.json({ success: true, data: getBillingStatus(user) });
});

export const createSubscriptionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { planCycle } = req.body as z.infer<typeof createSubscriptionSchema>;
  const result = await createUserSubscription(req.userId!, planCycle);
  res.status(201).json({ success: true, data: result });
});

export const cancelSubscriptionHandler = asyncHandler(async (req: Request, res: Response) => {
  await cancelUserSubscription(req.userId!);
  res.json({ success: true, data: null });
});

export const webhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const rawBody = (req.body as Buffer).toString('utf8');
  await handleWebhook(rawBody, signature);
  res.json({ success: true, data: null });
});
