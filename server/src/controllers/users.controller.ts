import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { DailyEntry } from '../models/DailyEntry';
import { Pattern } from '../models/Pattern';
import { Experiment } from '../models/Experiment';
import { Insight } from '../models/Insight';
import { WeeklyReport } from '../models/WeeklyReport';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { AUTH_COOKIE_NAME } from '../utils/jwt';

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  goals: z.array(z.string()).max(20).optional(),
  notificationPreferences: z
    .object({
      dailyReminder: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    })
    .optional(),
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

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();
  res.json({ success: true, data: { user: publicUser(user) } });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body as z.infer<typeof updateMeSchema>;
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.goals !== undefined) user.goals = updates.goals;
  if (updates.notificationPreferences) {
    user.notificationPreferences ??= { dailyReminder: true, weeklyReport: true };
    if (updates.notificationPreferences.dailyReminder !== undefined) {
      user.notificationPreferences.dailyReminder = updates.notificationPreferences.dailyReminder;
    }
    if (updates.notificationPreferences.weeklyReport !== undefined) {
      user.notificationPreferences.weeklyReport = updates.notificationPreferences.weeklyReport;
    }
  }

  await user.save();
  res.json({ success: true, data: { user: publicUser(user) } });
});

export const exportUserData = asyncHandler(async (req: Request, res: Response) => {
  const [user, entries, patterns, experiments, insights] = await Promise.all([
    User.findById(req.userId),
    DailyEntry.find({ userId: req.userId }).sort({ date: 1 }),
    Pattern.find({ userId: req.userId }),
    Experiment.find({ userId: req.userId }),
    Insight.find({ userId: req.userId }),
  ]);
  if (!user) throw ApiError.unauthorized();

  res.setHeader('Content-Disposition', 'attachment; filename="patternly-export.json"');
  res.json({
    success: true,
    data: {
      user: publicUser(user),
      entries,
      patterns,
      experiments,
      insights,
      exportedAt: new Date().toISOString(),
    },
  });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  await Promise.all([
    DailyEntry.deleteMany({ userId }),
    Pattern.deleteMany({ userId }),
    Experiment.deleteMany({ userId }),
    Insight.deleteMany({ userId }),
    WeeklyReport.deleteMany({ userId }),
  ]);
  await User.findByIdAndDelete(userId);
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.json({ success: true, data: null });
});
