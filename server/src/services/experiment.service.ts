import { Experiment, type ExperimentDoc } from '../models/Experiment';
import { DailyEntry } from '../models/DailyEntry';
import { User } from '../models/User';
import { addDays, daysBetween } from '../utils/date';
import { compareGroups } from './patternEngine.service';
import { analyzeExperiment, buildFallbackAnalysis } from './ai/experimentAnalysis.service';
import { ApiError } from '../utils/ApiError';
import { getAllowedExperimentPeriods, getPlanLimits, isUnderLimit } from './featureLimit.service';

export type MetricField = 'productivity' | 'mood' | 'energy' | 'sleepHours';

/** Auto-advances baseline -> active once the baseline window has elapsed. Persists the change. */
async function resolveStatus(experiment: ExperimentDoc): Promise<ExperimentDoc> {
  if (experiment.status === 'baseline' && new Date() > experiment.baseline.endDate) {
    experiment.status = 'active';
    await experiment.save();
  }
  return experiment;
}

export async function listExperiments(userId: string): Promise<ExperimentDoc[]> {
  const experiments = await Experiment.find({ userId }).sort({ createdAt: -1 });
  return Promise.all(experiments.map(resolveStatus));
}

export async function getExperimentById(userId: string, id: string): Promise<ExperimentDoc> {
  const experiment = await Experiment.findOne({ _id: id, userId });
  if (!experiment) throw ApiError.notFound('Experiment not found', 'EXPERIMENT_NOT_FOUND');
  return resolveStatus(experiment);
}

export interface CreateExperimentInput {
  title: string;
  hypothesis: string;
  patternId?: string | null;
  baselineDays: 7 | 14;
  experimentDays: 7 | 14 | 21 | 30;
  primaryMetric: MetricField;
  secondaryMetrics?: MetricField[];
}

export async function createExperiment(userId: string, input: CreateExperimentInput): Promise<ExperimentDoc> {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized();

  const limits = getPlanLimits(user);
  const activeCount = await Experiment.countDocuments({ userId, status: { $in: ['baseline', 'active'] } });
  if (!isUnderLimit(activeCount, limits.maxActiveExperiments)) {
    throw ApiError.forbidden(
      'Your plan only allows a limited number of active experiments. Upgrade to Pro for unlimited experiments.',
      'EXPERIMENT_LIMIT_REACHED',
    );
  }

  const allowedPeriods = getAllowedExperimentPeriods(user);
  if (!allowedPeriods.includes(input.experimentDays)) {
    throw ApiError.forbidden('This experiment length is only available on Pro.', 'EXPERIMENT_LENGTH_RESTRICTED');
  }

  return Experiment.create({
    userId,
    patternId: input.patternId ?? null,
    title: input.title,
    hypothesis: input.hypothesis,
    baseline: { startDate: new Date(0), endDate: new Date(0) },
    experimentPeriod: { startDate: new Date(0), endDate: new Date(0) },
    baselineDays: input.baselineDays,
    experimentDays: input.experimentDays,
    primaryMetric: input.primaryMetric,
    secondaryMetrics: input.secondaryMetrics ?? [],
    status: 'draft',
  });
}

export async function startExperiment(userId: string, id: string): Promise<ExperimentDoc> {
  const experiment = await Experiment.findOne({ _id: id, userId });
  if (!experiment) throw ApiError.notFound('Experiment not found', 'EXPERIMENT_NOT_FOUND');
  if (experiment.status !== 'draft') {
    throw ApiError.badRequest('Only draft experiments can be started', 'INVALID_EXPERIMENT_STATE');
  }

  const baselineDays = experiment.baselineDays;
  const experimentDays = experiment.experimentDays;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const baselineEnd = addDays(today, baselineDays - 1);
  const experimentStart = addDays(baselineEnd, 1);
  const experimentEnd = addDays(experimentStart, experimentDays - 1);

  experiment.baseline = { startDate: today, endDate: baselineEnd };
  experiment.experimentPeriod = { startDate: experimentStart, endDate: experimentEnd };
  experiment.status = 'baseline';
  await experiment.save();
  return experiment;
}

export async function cancelExperiment(userId: string, id: string): Promise<ExperimentDoc> {
  const experiment = await Experiment.findOne({ _id: id, userId });
  if (!experiment) throw ApiError.notFound('Experiment not found', 'EXPERIMENT_NOT_FOUND');
  if (experiment.status === 'completed' || experiment.status === 'cancelled') {
    throw ApiError.badRequest('Experiment already finished', 'INVALID_EXPERIMENT_STATE');
  }
  experiment.status = 'cancelled';
  await experiment.save();
  return experiment;
}

export interface ExperimentProgress {
  phase: 'baseline' | 'active' | 'completed' | 'cancelled' | 'draft';
  currentDay: number;
  totalDays: number;
  readyToComplete: boolean;
}

export function getExperimentProgress(experiment: ExperimentDoc): ExperimentProgress {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (experiment.status === 'baseline') {
    const totalDays = daysBetween(experiment.baseline.startDate, experiment.baseline.endDate) + 1;
    const currentDay = Math.min(Math.max(daysBetween(experiment.baseline.startDate, today) + 1, 1), totalDays);
    return { phase: 'baseline', currentDay, totalDays, readyToComplete: false };
  }

  if (experiment.status === 'active') {
    const totalDays = daysBetween(experiment.experimentPeriod.startDate, experiment.experimentPeriod.endDate) + 1;
    const currentDay = Math.min(
      Math.max(daysBetween(experiment.experimentPeriod.startDate, today) + 1, 1),
      totalDays,
    );
    return {
      phase: 'active',
      currentDay,
      totalDays,
      readyToComplete: today > experiment.experimentPeriod.endDate,
    };
  }

  return { phase: experiment.status as any, currentDay: 0, totalDays: 0, readyToComplete: false };
}

export async function completeExperiment(userId: string, id: string): Promise<ExperimentDoc> {
  const experiment = await Experiment.findOne({ _id: id, userId });
  if (!experiment) throw ApiError.notFound('Experiment not found', 'EXPERIMENT_NOT_FOUND');
  if (experiment.status !== 'active' && experiment.status !== 'baseline') {
    throw ApiError.badRequest('Only in-progress experiments can be completed', 'INVALID_EXPERIMENT_STATE');
  }

  const metric = experiment.primaryMetric as MetricField;
  const [baselineEntries, experimentEntries] = await Promise.all([
    DailyEntry.find({
      userId,
      date: { $gte: experiment.baseline.startDate, $lte: experiment.baseline.endDate },
    }),
    DailyEntry.find({
      userId,
      date: { $gte: experiment.experimentPeriod.startDate, $lte: experiment.experimentPeriod.endDate },
    }),
  ]);

  const baselineValues = baselineEntries.map((e) => (e as any)[metric] as number);
  const experimentValues = experimentEntries.map((e) => (e as any)[metric] as number);

  const comparison = compareGroups(experimentValues, baselineValues, 'Experiment period', 'Baseline period');

  const baseResult = comparison
    ? {
        baselineValue: comparison.statistics.groupBValue,
        experimentValue: comparison.statistics.groupAValue,
        absoluteChange: comparison.statistics.difference,
        percentageChange: comparison.statistics.percentageDifference,
        baselineSampleSize: comparison.statistics.groupBCount,
        experimentSampleSize: comparison.statistics.groupACount,
        confidence: comparison.confidence,
      }
    : {
        baselineValue: baselineValues.length ? average(baselineValues) : 0,
        experimentValue: experimentValues.length ? average(experimentValues) : 0,
        absoluteChange: 0,
        percentageChange: 0,
        baselineSampleSize: baselineEntries.length,
        experimentSampleSize: experimentEntries.length,
        confidence: 'insufficient' as const,
      };

  experiment.result = { ...baseResult, caveats: [], conclusion: '', nextExperiment: '', aiStatus: 'pending' };
  experiment.status = 'completed';
  experiment.completedAt = new Date();
  await experiment.save();

  const aiInput = {
    title: experiment.title,
    hypothesis: experiment.hypothesis,
    primaryMetric: experiment.primaryMetric,
    baselineValue: baseResult.baselineValue,
    baselineSampleSize: baseResult.baselineSampleSize,
    experimentValue: baseResult.experimentValue,
    experimentSampleSize: baseResult.experimentSampleSize,
    percentageChange: baseResult.percentageChange,
    confidence: baseResult.confidence,
  };

  try {
    const analysis = await analyzeExperiment(aiInput);
    experiment.result.conclusion = analysis.conclusion;
    experiment.result.caveats = analysis.caveats;
    experiment.result.nextExperiment = analysis.nextExperiment;
    experiment.result.aiStatus = 'succeeded';
  } catch (err) {
    console.error('[experiment.service] AI analysis failed, using fallback', err);
    const fallback = buildFallbackAnalysis(aiInput);
    experiment.result.conclusion = fallback.conclusion;
    experiment.result.caveats = fallback.caveats;
    experiment.result.nextExperiment = fallback.nextExperiment;
    experiment.result.aiStatus = 'failed';
  }
  await experiment.save();
  return experiment;
}

function average(values: number[]): number {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}
