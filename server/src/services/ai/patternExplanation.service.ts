import { z } from 'zod';
import { callLLM, extractJson } from './llmClient';
import type { GroupComparisonStats, Confidence } from '../patternEngine.service';

export interface PatternExplanationInput {
  variableA: string;
  variableB: string;
  statistics: GroupComparisonStats;
  confidence: Confidence;
  potentialConfounders: string[];
}

export interface PatternExplanationOutput {
  title: string;
  summary: string;
  caveats: string[];
  suggestedExperiment: string;
}

const outputSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(400),
  caveats: z.array(z.string()).max(5),
  suggestedExperiment: z.string().min(1).max(300),
});

const SYSTEM_PROMPT = `You are a careful data-analysis assistant inside Patternly, a personal habit-tracking app.
You are given statistics that have ALREADY been calculated by the backend. Your job is only to explain them in
plain, warm, precise language. Rules:
- Never invent numbers. Only reference numbers present in the input.
- Never claim causation. Use phrases like "appears associated with", "may be related to", "your data suggests".
- Always mention the sample size context so the user calibrates trust appropriately.
- If potentialConfounders are provided, turn at least one into a caveat.
- Respond with ONLY a JSON object matching this shape, no prose outside the JSON:
{"title": string, "summary": string, "caveats": string[], "suggestedExperiment": string}`;

export function buildFallbackExplanation(input: PatternExplanationInput): PatternExplanationOutput {
  const { statistics, variableA, variableB } = input;
  const direction = statistics.difference >= 0 ? 'higher' : 'lower';
  return {
    title: `${capitalize(variableA)} may be related to your ${variableB}`,
    summary: `Your ${variableB} was ${Math.abs(statistics.percentageDifference)}% ${direction} on ${statistics.groupALabel.toLowerCase()} compared to ${statistics.groupBLabel.toLowerCase()}, based on ${statistics.sampleSize} days.`,
    caveats: input.potentialConfounders.length
      ? [`Note: ${input.potentialConfounders[0]}, which may also explain part of this difference.`]
      : ['This is an association in your own data, not a controlled experiment.'],
    suggestedExperiment: `Try running a focused experiment to test whether ${variableA} actually affects your ${variableB}.`,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function explainPattern(input: PatternExplanationInput): Promise<PatternExplanationOutput> {
  const userPrompt = JSON.stringify({
    variableA: input.variableA,
    variableB: input.variableB,
    groupALabel: input.statistics.groupALabel,
    groupAValue: input.statistics.groupAValue,
    groupACount: input.statistics.groupACount,
    groupBLabel: input.statistics.groupBLabel,
    groupBValue: input.statistics.groupBValue,
    groupBCount: input.statistics.groupBCount,
    percentageDifference: input.statistics.percentageDifference,
    sampleSize: input.statistics.sampleSize,
    confidence: input.confidence,
    potentialConfounders: input.potentialConfounders,
  });

  const raw = await callLLM(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJson<unknown>(raw);
  return outputSchema.parse(parsed);
}
