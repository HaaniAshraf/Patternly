import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    next(ApiError.unauthorized());
    return;
  }
  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired session', 'INVALID_SESSION'));
  }
}

export async function requireOnboarded(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId).select('onboardingCompleted');
    if (!user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!user.onboardingCompleted) {
      next(ApiError.forbidden('Onboarding must be completed first', 'ONBOARDING_REQUIRED'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
