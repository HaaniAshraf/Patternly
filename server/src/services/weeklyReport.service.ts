import { DailyEntry } from '../models/DailyEntry';
import { WeeklyReport, type WeeklyReportDoc } from '../models/WeeklyReport';
import { addDays } from '../utils/date';
import { getHighestConfidencePattern } from './pattern.service';
import { generateWeeklyReport, buildFallbackWeeklyReport } from './ai/weeklyReport.service';

type MetricKey = 'productivity' | 'mood' | 'sleepHours' | 'energy';
const METRICS: MetricKey[] = ['productivity', 'mood', 'sleepHours', 'energy'];

/** Monday-aligned ISO week start, used as a stable cache key for "once per week". */
function currentWeekStart(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const day = now.getUTCDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7;
  return addDays(now, -diffToMonday);
}

async function averageMetrics(userId: string, start: Date, end: Date): Promise<Record<MetricKey, number | null>> {
  const entries = await DailyEntry.find({ userId, date: { $gte: start, $lte: end } });
  const result = {} as Record<MetricKey, number | null>;
  for (const key of METRICS) {
    if (entries.length === 0) {
      result[key] = null;
      continue;
    }
    const values = entries.map((e) => (e as any)[key] as number);
    result[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }
  return result;
}

function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

export async function getWeeklyReport(userId: string): Promise<WeeklyReportDoc> {
  const weekStart = currentWeekStart();
  const weekEnd = addDays(weekStart, 6);

  const existing = await WeeklyReport.findOne({ userId, weekStart });
  if (existing) return existing;

  const previousWeekStart = addDays(weekStart, -7);
  const previousWeekEnd = addDays(weekStart, -1);

  const [current, previous, strongestPattern] = await Promise.all([
    averageMetrics(userId, weekStart, weekEnd),
    averageMetrics(userId, previousWeekStart, previousWeekEnd),
    getHighestConfidencePattern(userId),
  ]);

  type MetricSummary = { current: number; previous: number; percentChange: number };
  const metrics: Record<MetricKey, MetricSummary> = Object.fromEntries(
    METRICS.map((key) => [
      key,
      {
        current: current[key] ?? 0,
        previous: previous[key] ?? 0,
        percentChange: percentChange(current[key], previous[key]) ?? 0,
      },
    ]),
  ) as Record<MetricKey, MetricSummary>;

  const report = await WeeklyReport.create({
    userId,
    weekStart,
    weekEnd,
    metrics,
    strongestPatternId: strongestPattern?._id ?? null,
    aiStatus: 'pending',
  });

  const aiInput = {
    metrics,
    strongestPattern: strongestPattern ? { title: strongestPattern.title, summary: strongestPattern.summary } : null,
  };

  try {
    const generated = await generateWeeklyReport(aiInput);
    report.whatChanged = generated.whatChanged;
    report.suggestedExperiment = generated.suggestedExperiment;
    report.aiStatus = 'succeeded';
  } catch (err) {
    console.error('[weeklyReport.service] AI generation failed, using fallback', err);
    const fallback = buildFallbackWeeklyReport(aiInput);
    report.whatChanged = fallback.whatChanged;
    report.suggestedExperiment = fallback.suggestedExperiment;
    report.aiStatus = 'failed';
  }
  await report.save();
  return report;
}
