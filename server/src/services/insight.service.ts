import { Pattern } from '../models/Pattern';
import { Experiment } from '../models/Experiment';
import { Insight } from '../models/Insight';

const OUTCOME_TO_CATEGORY: Record<string, 'productivity' | 'mood' | 'energy'> = {
  productivity: 'productivity',
  mood: 'mood',
  energy: 'energy',
};

/**
 * Insights are a derived view over patterns + completed experiments, so we simply
 * recompute the whole set rather than trying to incrementally patch it.
 */
export async function refreshInsights(userId: string): Promise<void> {
  const [patterns, experiments] = await Promise.all([
    Pattern.find({ userId, status: 'active', confidence: { $ne: 'insufficient' } }),
    Experiment.find({ userId, status: 'completed' }),
  ]);

  await Insight.deleteMany({ userId });

  const docs = patterns
    .filter((p) => OUTCOME_TO_CATEGORY[p.variableB])
    .map((pattern) => {
      const relatedExperimentIds = experiments
        .filter((e) => e.patternId?.toString() === pattern._id.toString())
        .map((e) => e._id);

      return {
        userId,
        category: OUTCOME_TO_CATEGORY[pattern.variableB],
        title: pattern.title,
        description: pattern.summary,
        evidence: {
          sampleSize: pattern.statistics.sampleSize,
          relatedPatternIds: [pattern._id],
          relatedExperimentIds,
        },
        confidence: pattern.confidence,
        status: 'active' as const,
      };
    });

  if (docs.length > 0) {
    await Insight.insertMany(docs);
  }
}
