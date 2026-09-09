import type { Request, Response } from 'express';
import { z } from 'zod';
import { DailyEntry } from '../models/DailyEntry';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { parseCalendarDate, todayCalendarDateUTC } from '../utils/date';
import { historyCutoffDate } from '../services/featureLimit.service';
import { analyzeAndStoreUserPatterns } from '../services/pattern.service';
import { refreshInsights } from '../services/insight.service';

/**
 * Fire-and-forget: re-running pattern analysis after every check-in keeps patterns fresh
 * without the user having to trigger it, but we don't want a slow AI call to delay the
 * check-in response — the whole point of check-in is to be a sub-30-second interaction.
 */
function reanalyzeInBackground(userId: string): void {
  analyzeAndStoreUserPatterns(userId)
    .then(() => refreshInsights(userId))
    .catch((err) => console.error('[entries.controller] background pattern analysis failed', err));
}

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const createEntrySchema = z.object({
  date: dateStringSchema,
  sleepHours: z.number().min(0).max(24),
  energy: z.number().int().min(1).max(10),
  mood: z.number().int().min(1).max(10),
  productivity: z.number().int().min(1).max(10),
  exercise: z.boolean(),
  note: z.string().max(500).optional().default(''),
});

export const updateEntrySchema = createEntrySchema.partial().omit({ date: true });

function serializeEntry(entry: any) {
  return {
    id: entry._id.toString(),
    date: entry.date.toISOString().slice(0, 10),
    sleepHours: entry.sleepHours,
    energy: entry.energy,
    mood: entry.mood,
    productivity: entry.productivity,
    exercise: entry.exercise,
    note: entry.note,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export const listEntries = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();

  const cutoff = historyCutoffDate(user);
  const query: Record<string, unknown> = { userId: req.userId };
  if (cutoff) query.date = { $gte: cutoff };

  const entries = await DailyEntry.find(query).sort({ date: -1 });
  res.json({ success: true, data: { entries: entries.map(serializeEntry) } });
});

export const getTodayEntry = asyncHandler(async (req: Request, res: Response) => {
  const dateStr = (req.query.date as string) ?? todayCalendarDateUTC();
  const parsed = dateStringSchema.safeParse(dateStr);
  if (!parsed.success) throw ApiError.badRequest('Invalid date query parameter', 'VALIDATION_ERROR');

  const date = parseCalendarDate(parsed.data);
  const entry = await DailyEntry.findOne({ userId: req.userId, date });
  res.json({ success: true, data: { entry: entry ? serializeEntry(entry) : null } });
});

export const getEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await DailyEntry.findOne({ _id: req.params.id, userId: req.userId });
  if (!entry) throw ApiError.notFound('Entry not found', 'ENTRY_NOT_FOUND');
  res.json({ success: true, data: { entry: serializeEntry(entry) } });
});

export const createEntry = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof createEntrySchema>;
  const date = parseCalendarDate(body.date);

  const existing = await DailyEntry.findOne({ userId: req.userId, date });
  if (existing) {
    throw ApiError.conflict("You've already checked in for this date", 'DUPLICATE_ENTRY');
  }

  const entry = await DailyEntry.create({
    userId: req.userId,
    date,
    sleepHours: body.sleepHours,
    energy: body.energy,
    mood: body.mood,
    productivity: body.productivity,
    exercise: body.exercise,
    note: body.note ?? '',
  });

  res.status(201).json({ success: true, data: { entry: serializeEntry(entry) } });
  reanalyzeInBackground(req.userId!);
});

export const updateEntry = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body as z.infer<typeof updateEntrySchema>;
  const entry = await DailyEntry.findOne({ _id: req.params.id, userId: req.userId });
  if (!entry) throw ApiError.notFound('Entry not found', 'ENTRY_NOT_FOUND');

  Object.assign(entry, updates);
  await entry.save();
  reanalyzeInBackground(req.userId!);

  res.json({ success: true, data: { entry: serializeEntry(entry) } });
});

export const deleteEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await DailyEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!entry) throw ApiError.notFound('Entry not found', 'ENTRY_NOT_FOUND');
  res.json({ success: true, data: null });
});
