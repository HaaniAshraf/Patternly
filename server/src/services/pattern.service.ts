import { DailyEntry } from '../models/DailyEntry';
import { Pattern, type PatternDoc } from '../models/Pattern';
import { User } from '../models/User';
import { analyzeCandidates } from './patternEngine.service';
import { explainPattern, buildFallbackExplanation } from './ai/patternExplanation.service';
import { getPlanLimits, isUnderLimit } from './featureLimit.service';

async function runAIExplanation(pattern: PatternDoc, potentialConfounders: string[]): Promise<void> {
  const statistics = pattern.statistics;
  const input = {
    variableA: pattern.variableA,
    variableB: pattern.variableB,
    // Mongoose embedded subdocuments don't spread reliably with `{ ...doc }` (their
    // fields live behind internal storage, not plain enumerable properties), so build
    // this explicitly rather than spreading `pattern.statistics`.
    statistics: {
      groupAValue: statistics.groupAValue,
      groupBValue: statistics.groupBValue,
      difference: statistics.difference,
      percentageDifference: statistics.percentageDifference,
      sampleSize: statistics.sampleSize,
      groupALabel: statistics.groupALabel,
      groupBLabel: statistics.groupBLabel,
      groupACount: statistics.groupACount,
      groupBCount: statistics.groupBCount,
      correlationCoefficient: statistics.correlationCoefficient ?? null,
    },
    confidence: pattern.confidence,
    potentialConfounders,
  };

  try {
    const explanation = await explainPattern(input);
    pattern.title = explanation.title;
    pattern.summary = explanation.summary;
    pattern.caveats = explanation.caveats;
    pattern.suggestedExperiment = explanation.suggestedExperiment;
    pattern.aiStatus = 'succeeded';
  } catch (err) {
    console.error('[pattern.service] AI explanation failed, using fallback', err);
    const fallback = buildFallbackExplanation(input);
    pattern.title = fallback.title;
    pattern.summary = fallback.summary;
    pattern.caveats = fallback.caveats;
    pattern.suggestedExperiment = fallback.suggestedExperiment;
    pattern.aiStatus = 'failed';
  }
  await pattern.save();
}

export async function analyzeAndStoreUserPatterns(userId: string): Promise<PatternDoc[]> {
  const [entries, user] = await Promise.all([
    DailyEntry.find({ userId }).sort({ date: 1 }),
    User.findById(userId),
  ]);
  if (!user) throw new Error('User not found');

  const candidateResults = analyzeCandidates(entries as any);
  const limits = getPlanLimits(user);
  const touched: PatternDoc[] = [];

  let activeCount = await Pattern.countDocuments({ userId, status: 'active' });

  for (const result of candidateResults) {
    if (result.status !== 'ok' || !result.candidate) continue;

    const existing = await Pattern.findOne({
      userId,
      variableA: result.variableA,
      variableB: result.variableB,
    });

    if (existing) {
      existing.statistics = result.candidate.statistics as any;
      existing.confidence = result.candidate.confidence;
      const needsAI = existing.aiStatus !== 'succeeded';
      await existing.save();
      if (needsAI) {
        await runAIExplanation(existing, result.potentialConfounders);
      }
      touched.push(existing);
      continue;
    }

    if (!isUnderLimit(activeCount, limits.maxActivePatterns)) {
      continue;
    }

    const created = await Pattern.create({
      userId,
      variableA: result.variableA,
      variableB: result.variableB,
      statistics: result.candidate.statistics,
      confidence: result.candidate.confidence,
      title: `${result.variableA} vs ${result.variableB}`,
      summary: 'Analyzing your data…',
      caveats: [],
      status: 'active',
      aiStatus: 'pending',
    });
    activeCount += 1;
    await runAIExplanation(created, result.potentialConfounders);
    touched.push(created);
  }

  return touched;
}

export async function getHighestConfidencePattern(userId: string): Promise<PatternDoc | null> {
  const order = { strong: 3, moderate: 2, weak: 1, insufficient: 0 } as const;
  const patterns = await Pattern.find({ userId, status: 'active' });
  if (patterns.length === 0) return null;
  return patterns.sort((a, b) => order[b.confidence] - order[a.confidence])[0];
}
