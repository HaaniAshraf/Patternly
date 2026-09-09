import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from '../utils/jwt';
import { sendWelcomeEmail } from '../services/email/email.service';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(200),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

function publicUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    plan: user.plan,
    goals: user.goals,
    curiosities: user.curiosities,
    onboardingCompleted: user.onboardingCompleted,
    notificationPreferences: user.notificationPreferences,
    createdAt: user.createdAt,
  };
}

function issueSession(res: Response, userId: string): void {
  const token = signAuthToken({ userId });
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  issueSession(res, user._id.toString());
  sendWelcomeEmail(user.email, user.name).catch((err) => console.error('[email] welcome email failed', err));

  res.status(201).json({ success: true, data: { user: publicUser(user) } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  issueSession(res, user._id.toString());
  res.json({ success: true, data: { user: publicUser(user) } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.json({ success: true, data: null });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();
  res.json({ success: true, data: { user: publicUser(user) } });
});
