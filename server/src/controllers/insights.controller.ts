import type { Request, Response } from 'express';
import { Insight } from '../models/Insight';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

function serializeInsight(insight: any) {
  return {
    id: insight._id.toString(),
    category: insight.category,
    title: insight.title,
    description: insight.description,
    evidence: insight.evidence,
    confidence: insight.confidence,
    status: insight.status,
    createdAt: insight.createdAt,
  };
}

export const listInsights = asyncHandler(async (req: Request, res: Response) => {
  const insights = await Insight.find({ userId: req.userId, status: 'active' }).sort({ createdAt: -1 });
  res.json({ success: true, data: { insights: insights.map(serializeInsight) } });
});

export const getInsight = asyncHandler(async (req: Request, res: Response) => {
  const insight = await Insight.findOne({ _id: req.params.id, userId: req.userId });
  if (!insight) throw ApiError.notFound('Insight not found', 'INSIGHT_NOT_FOUND');
  res.json({ success: true, data: { insight: serializeInsight(insight) } });
});
