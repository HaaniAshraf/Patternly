import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getWeeklyReport } from '../services/weeklyReport.service';
import { User } from '../models/User';
import { getPlanLimits } from '../services/featureLimit.service';
import { ApiError } from '../utils/ApiError';

export const getWeeklyReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.unauthorized();
  if (!getPlanLimits(user).weeklyReports) {
    throw ApiError.forbidden('Weekly reports are a Pro feature', 'PRO_FEATURE_REQUIRED');
  }

  const report = await getWeeklyReport(req.userId!);
  res.json({
    success: true,
    data: {
      report: {
        weekStart: report.weekStart.toISOString().slice(0, 10),
        weekEnd: report.weekEnd.toISOString().slice(0, 10),
        metrics: report.metrics,
        whatChanged: report.whatChanged,
        suggestedExperiment: report.suggestedExperiment,
        strongestPatternId: report.strongestPatternId ? report.strongestPatternId.toString() : null,
      },
    },
  });
});
