import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createExperiment,
  startExperiment,
  cancelExperiment,
  completeExperiment,
  listExperiments,
  getExperimentById,
  getExperimentProgress,
} from '../services/experiment.service';
import { refreshInsights } from '../services/insight.service';

const metricEnum = z.enum(['productivity', 'mood', 'energy', 'sleepHours']);

export const createExperimentSchema = z.object({
  title: z.string().trim().min(1).max(150),
  hypothesis: z.string().trim().min(1).max(500),
  patternId: z.string().nullable().optional(),
  baselineDays: z.union([z.literal(7), z.literal(14)]),
  experimentDays: z.union([z.literal(7), z.literal(14), z.literal(21), z.literal(30)]),
  primaryMetric: metricEnum,
  secondaryMetrics: z.array(metricEnum).max(3).optional(),
});

function serializeExperiment(experiment: any) {
  return {
    id: experiment._id.toString(),
    patternId: experiment.patternId ? experiment.patternId.toString() : null,
    title: experiment.title,
    hypothesis: experiment.hypothesis,
    baseline: experiment.baseline,
    experimentPeriod: experiment.experimentPeriod,
    baselineDays: experiment.baselineDays,
    experimentDays: experiment.experimentDays,
    primaryMetric: experiment.primaryMetric,
    secondaryMetrics: experiment.secondaryMetrics,
    status: experiment.status,
    result: experiment.result ?? null,
    progress: getExperimentProgress(experiment),
    createdAt: experiment.createdAt,
    completedAt: experiment.completedAt,
  };
}

export const listExperimentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const experiments = await listExperiments(req.userId!);
  res.json({ success: true, data: { experiments: experiments.map(serializeExperiment) } });
});

export const getExperimentHandler = asyncHandler(async (req: Request, res: Response) => {
  const experiment = await getExperimentById(req.userId!, req.params.id);
  res.json({ success: true, data: { experiment: serializeExperiment(experiment) } });
});

export const createExperimentHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof createExperimentSchema>;
  const experiment = await createExperiment(req.userId!, body);
  res.status(201).json({ success: true, data: { experiment: serializeExperiment(experiment) } });
});

export const startExperimentHandler = asyncHandler(async (req: Request, res: Response) => {
  const experiment = await startExperiment(req.userId!, req.params.id);
  res.json({ success: true, data: { experiment: serializeExperiment(experiment) } });
});

export const cancelExperimentHandler = asyncHandler(async (req: Request, res: Response) => {
  const experiment = await cancelExperiment(req.userId!, req.params.id);
  res.json({ success: true, data: { experiment: serializeExperiment(experiment) } });
});

export const completeExperimentHandler = asyncHandler(async (req: Request, res: Response) => {
  const experiment = await completeExperiment(req.userId!, req.params.id);
  await refreshInsights(req.userId!);
  res.json({ success: true, data: { experiment: serializeExperiment(experiment) } });
});
