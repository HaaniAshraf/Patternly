import { z } from 'zod';
import { callLLM, extractJson } from './llmClient';
import type { Confidence } from '../patternEngine.service';

export interface ExperimentAnalysisInput {
  title: string;
  hypothesis: string;
  primaryMetric: string;
  baselineValue: number;
  baselineSampleSize: number;
  experimentValue: number;
  experimentSampleSize: number;
  percentageChange: number;
  confidence: Confidence;
}

export interface ExperimentAnalysisOutput {
  conclusion: string;
  caveats: string[];
  nextExperiment: string;
}

const outputSchema = z.object({
  conclusion: z.string().min(1).max(200),
  caveats: z.array(z.string()).max(5),
  nextExperiment: z.string().min(1).max(300),
});

const SYSTEM_PROMPT = `You are a careful data-analysis assistant inside Patternly, a personal experiment app.
You are given experiment results that have ALREADY been calculated by the backend (baseline vs experiment period
averages). Your job is only to interpret them in plain language. Rules:
- Never invent numbers. Only reference numbers present in the input.
- Never claim certainty or causation. Use a short conclusion phrase such as "Probably supported",
  "Inconclusive", or "Not supported", followed by one sentence of explanation.
- Always include at least one caveat about confounding factors, lifestyle changes, or small sample size.
- Suggest one concrete, narrower follow-up experiment.
- Respond with ONLY a JSON object matching this shape, no prose outside the JSON:
{"conclusion": string, "caveats": string[], "nextExperiment": string}`;

export function buildFallbackAnalysis(input: ExperimentAnalysisInput): ExperimentAnalysisOutput {
  const direction = input.percentageChange >= 0 ? 'increased' : 'decreased';
  const supported = Math.abs(input.percentageChange) >= 5 && input.confidence !== 'insufficient';
  return {
    conclusion: supported
      ? `Probably supported: your ${input.primaryMetric} ${direction} by ${Math.abs(input.percentageChange)}% during the experiment.`
      : `Inconclusive: your ${input.primaryMetric} did not change meaningfully during the experiment.`,
    caveats: [
      'Other things in your life may have changed during the experiment period besides the variable you tested.',
    ],
    nextExperiment: `Consider testing a more specific version of "${input.title}" over a longer period to confirm the effect.`,
  };
}

export async function analyzeExperiment(input: ExperimentAnalysisInput): Promise<ExperimentAnalysisOutput> {
  const raw = await callLLM(SYSTEM_PROMPT, JSON.stringify(input));
  const parsed = extractJson<unknown>(raw);
  return outputSchema.parse(parsed);
}
