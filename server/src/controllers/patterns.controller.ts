import type { Request, Response } from 'express';
import { Pattern } from '../models/Pattern';
import { DailyEntry } from '../models/DailyEntry';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { analyzeAndStoreUserPatterns } from '../services/pattern.service';
import { refreshInsights } from '../services/insight.service';

function serializePattern(pattern: any) {
  return {
    id: pattern._id.toString(),
    variableA: pattern.variableA,
    variableB: pattern.variableB,
    statistics: pattern.statistics,
    confidence: pattern.confidence,
    title: pattern.title,
    summary: pattern.summary,
    caveats: pattern.caveats,
    suggestedExperiment: pattern.suggestedExperiment,
    status: pattern.status,
    aiStatus: pattern.aiStatus,
    createdAt: pattern.createdAt,
  };
}

export const listPatterns = asyncHandler(async (req: Request, res: Response) => {
  const patterns = await Pattern.find({ userId: req.userId, status: 'active' }).sort({ createdAt: -1 });
  res.json({ success: true, data: { patterns: patterns.map(serializePattern) } });
});

export const getPattern = asyncHandler(async (req: Request, res: Response) => {
  const pattern = await Pattern.findOne({ _id: req.params.id, userId: req.userId });
  if (!pattern) throw ApiError.notFound('Pattern not found', 'PATTERN_NOT_FOUND');

  const relatedEntries = await DailyEntry.find({ userId: req.userId }).sort({ date: -1 }).limit(30);

  res.json({
    success: true,
    data: {
      pattern: serializePattern(pattern),
      relatedEntries: relatedEntries.map((e) => ({
        id: e._id.toString(),
        date: e.date.toISOString().slice(0, 10),
        sleepHours: e.sleepHours,
        energy: e.energy,
        mood: e.mood,
        productivity: e.productivity,
        exercise: e.exercise,
      })),
    },
  });
});

export const analyzePatterns = asyncHandler(async (req: Request, res: Response) => {
  const patterns = await analyzeAndStoreUserPatterns(req.userId!);
  await refreshInsights(req.userId!);
  res.json({ success: true, data: { patterns: patterns.map(serializePattern) } });
});

export const dismissPattern = asyncHandler(async (req: Request, res: Response) => {
  const pattern = await Pattern.findOne({ _id: req.params.id, userId: req.userId });
  if (!pattern) throw ApiError.notFound('Pattern not found', 'PATTERN_NOT_FOUND');
  pattern.status = 'dismissed';
  await pattern.save();
  await refreshInsights(req.userId!);
  res.json({ success: true, data: { pattern: serializePattern(pattern) } });
});
