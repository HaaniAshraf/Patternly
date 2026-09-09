import { mean, sampleCorrelation, sampleStandardDeviation } from 'simple-statistics';
import type { DailyEntryDoc } from '../models/DailyEntry';

export type Confidence = 'strong' | 'moderate' | 'weak' | 'insufficient';

export interface GroupComparisonStats {
  groupAValue: number;
  groupBValue: number;
  difference: number;
  percentageDifference: number;
  sampleSize: number;
  groupALabel: string;
  groupBLabel: string;
  groupACount: number;
  groupBCount: number;
  correlationCoefficient: number | null;
}

export interface PatternCandidate {
  variableA: string;
  variableB: string;
  statistics: GroupComparisonStats;
  confidence: Confidence;
}

// Minimum days of data before we attempt any comparison at all.
export const MIN_TOTAL_DAYS = 7;
export const PREFERRED_TOTAL_DAYS = 14;
// Each side of a comparison needs enough observations to mean anything.
const MIN_GROUP_SIZE = 3;

/**
 * Confidence is derived from effect size (Cohen's d) rather than a p-value: with the
 * small day-counts this app realistically has (weeks, not thousands of trials), a normal-
 * approximation p-value would imply more precision than the data supports. Thresholds
 * follow the conventional small/medium/large Cohen's d bands (0.2 / 0.5 / 0.8).
 */
function confidenceFromEffectSize(cohensD: number, sampleSize: number, minGroupCount: number): Confidence {
  const d = Math.abs(cohensD);
  if (d >= 0.8 && sampleSize >= PREFERRED_TOTAL_DAYS && minGroupCount >= 5) return 'strong';
  if (d >= 0.5 && sampleSize >= 10) return 'moderate';
  if (d >= 0.2) return 'weak';
  return 'insufficient';
}

function pooledStdDev(a: number[], b: number[]): number {
  const varA = sampleStandardDeviation(a) ** 2;
  const varB = sampleStandardDeviation(b) ** 2;
  const pooled = ((a.length - 1) * varA + (b.length - 1) * varB) / (a.length + b.length - 2);
  return Math.sqrt(Math.max(pooled, 0));
}

export function compareGroups(
  groupA: number[],
  groupB: number[],
  groupALabel: string,
  groupBLabel: string,
  correlationCoefficient: number | null = null,
): { statistics: GroupComparisonStats; confidence: Confidence } | null {
  if (groupA.length < MIN_GROUP_SIZE || groupB.length < MIN_GROUP_SIZE) {
    return null;
  }

  const groupAValue = mean(groupA);
  const groupBValue = mean(groupB);
  const difference = groupAValue - groupBValue;
  // Guard against a zero baseline (e.g. average of 0) producing NaN/Infinity.
  const percentageDifference = groupBValue === 0 ? 0 : (difference / groupBValue) * 100;

  const sd = pooledStdDev(groupA, groupB);
  // Zero within-group variance with a nonzero between-group difference means the groups
  // are perfectly separated — the strongest possible signal, not a divide-by-zero no-op.
  const cohensD = sd === 0 ? (difference === 0 ? 0 : Infinity) : difference / sd;

  const sampleSize = groupA.length + groupB.length;
  const confidence = confidenceFromEffectSize(cohensD, sampleSize, Math.min(groupA.length, groupB.length));

  return {
    statistics: {
      groupAValue: round(groupAValue),
      groupBValue: round(groupBValue),
      difference: round(difference),
      percentageDifference: round(percentageDifference),
      sampleSize,
      groupALabel,
      groupBLabel,
      groupACount: groupA.length,
      groupBCount: groupB.length,
      correlationCoefficient: correlationCoefficient === null ? null : round(correlationCoefficient),
    },
    confidence,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Splits a continuous predictor into "higher X" / "lower X" groups at the median. */
function medianSplit(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

interface VariableExtractor {
  key: string;
  label: string;
  extract: (entry: DailyEntryDoc) => number;
}

const OUTCOME_VARIABLES: Record<string, VariableExtractor> = {
  productivity: { key: 'productivity', label: 'Productivity', extract: (e) => e.productivity },
  mood: { key: 'mood', label: 'Mood', extract: (e) => e.mood },
  energy: { key: 'energy', label: 'Energy', extract: (e) => e.energy },
};

const PREDICTOR_PAIRS: Array<{ variableA: string; variableB: string }> = [
  { variableA: 'exercise', variableB: 'productivity' },
  { variableA: 'exercise', variableB: 'mood' },
  { variableA: 'sleep', variableB: 'productivity' },
  { variableA: 'sleep', variableB: 'energy' },
  { variableA: 'sleep', variableB: 'mood' },
  { variableA: 'energy', variableB: 'productivity' },
];

export interface CandidateResult {
  variableA: string;
  variableB: string;
  status: 'ok' | 'insufficient_data';
  candidate: PatternCandidate | null;
  potentialConfounders: string[];
}

/**
 * Cheap confounder check: if some other tracked variable also differs meaningfully
 * between the two comparison groups, the observed effect may be partly attributable
 * to it rather than to variableA. This is surfaced to the AI as context, not proof.
 */
function detectPotentialConfounders(
  groupAEntries: DailyEntryDoc[],
  groupBEntries: DailyEntryDoc[],
  excludeVariable: string,
): string[] {
  if (groupAEntries.length === 0 || groupBEntries.length === 0) return [];

  const confounders: string[] = [];
  const CONFOUNDER_THRESHOLD_PCT = 10;

  if (excludeVariable !== 'sleep') {
    const sleepA = mean(groupAEntries.map((e) => e.sleepHours));
    const sleepB = mean(groupBEntries.map((e) => e.sleepHours));
    if (sleepB !== 0 && Math.abs(((sleepA - sleepB) / sleepB) * 100) >= CONFOUNDER_THRESHOLD_PCT) {
      confounders.push(sleepA > sleepB ? 'sleep was higher in the first group' : 'sleep was lower in the first group');
    }
  }

  if (excludeVariable !== 'exercise') {
    const exerciseRateA = mean(groupAEntries.map((e) => (e.exercise ? 1 : 0)));
    const exerciseRateB = mean(groupBEntries.map((e) => (e.exercise ? 1 : 0)));
    if (Math.abs(exerciseRateA - exerciseRateB) >= 0.2) {
      confounders.push(
        exerciseRateA > exerciseRateB
          ? 'exercise was more frequent in the first group'
          : 'exercise was less frequent in the first group',
      );
    }
  }

  return confounders;
}

export function analyzeCandidates(entries: DailyEntryDoc[]): CandidateResult[] {
  const results: CandidateResult[] = [];

  if (entries.length < MIN_TOTAL_DAYS) {
    return PREDICTOR_PAIRS.map(({ variableA, variableB }) => ({
      variableA,
      variableB,
      status: 'insufficient_data',
      candidate: null,
      potentialConfounders: [],
    }));
  }

  for (const { variableA, variableB } of PREDICTOR_PAIRS) {
    const outcome = OUTCOME_VARIABLES[variableB];

    if (variableA === 'exercise') {
      const groupAEntries = entries.filter((e) => e.exercise);
      const groupBEntries = entries.filter((e) => !e.exercise);
      const comparison = compareGroups(
        groupAEntries.map(outcome.extract),
        groupBEntries.map(outcome.extract),
        'Exercise days',
        'Non-exercise days',
      );
      const confounders = detectPotentialConfounders(groupAEntries, groupBEntries, 'exercise');
      results.push(toCandidateResult(variableA, variableB, comparison, confounders));
      continue;
    }

    // sleep / energy as continuous predictors: median split into higher/lower groups.
    const predictorValues = entries.map((e) => (variableA === 'sleep' ? e.sleepHours : e.energy));
    const median = medianSplit(predictorValues);
    const groupAEntries: DailyEntryDoc[] = [];
    const groupBEntries: DailyEntryDoc[] = [];
    const predictorSeries: number[] = [];
    const outcomeSeries: number[] = [];

    entries.forEach((entry) => {
      const predictorValue = variableA === 'sleep' ? entry.sleepHours : entry.energy;
      predictorSeries.push(predictorValue);
      outcomeSeries.push(outcome.extract(entry));
      if (predictorValue > median) groupAEntries.push(entry);
      else groupBEntries.push(entry);
    });

    const correlation =
      predictorSeries.length >= MIN_GROUP_SIZE * 2 ? sampleCorrelation(predictorSeries, outcomeSeries) : null;
    const predictorLabel = variableA === 'sleep' ? 'sleep' : 'energy';
    const comparison = compareGroups(
      groupAEntries.map(outcome.extract),
      groupBEntries.map(outcome.extract),
      `Higher ${predictorLabel} days`,
      `Lower ${predictorLabel} days`,
      Number.isFinite(correlation) ? correlation : null,
    );
    const confounders = detectPotentialConfounders(groupAEntries, groupBEntries, variableA);
    results.push(toCandidateResult(variableA, variableB, comparison, confounders));
  }

  return results;
}

function toCandidateResult(
  variableA: string,
  variableB: string,
  comparison: ReturnType<typeof compareGroups>,
  potentialConfounders: string[],
): CandidateResult {
  if (!comparison || comparison.confidence === 'insufficient') {
    return { variableA, variableB, status: 'insufficient_data', candidate: null, potentialConfounders: [] };
  }
  return {
    variableA,
    variableB,
    status: 'ok',
    candidate: {
      variableA,
      variableB,
      statistics: comparison.statistics,
      confidence: comparison.confidence,
    },
    potentialConfounders,
  };
}
