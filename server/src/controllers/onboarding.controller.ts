import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const onboardingSchema = z.object({
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  curiosities: z.array(z.string()).min(1, 'Select or describe at least one curiosity'),
});

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const { goals, curiosities } = req.body as z.infer<typeof onboardingSchema>;

  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();

  user.goals = goals;
  user.curiosities = curiosities;
  user.onboardingCompleted = true;
  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        onboardingCompleted: user.onboardingCompleted,
        goals: user.goals,
        curiosities: user.curiosities,
      },
    },
  });
});
