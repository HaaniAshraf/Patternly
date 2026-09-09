import { z } from 'zod';
import { callLLM, extractJson } from './llmClient';

export interface WeeklyReportInput {
  metrics: Record<string, { current: number; previous: number; percentChange: number }>;
  strongestPattern: { title: string; summary: string } | null;
}

export interface WeeklyReportOutput {
  whatChanged: string;
  suggestedExperiment: string;
}

const outputSchema = z.object({
  whatChanged: z.string().min(1).max(400),
  suggestedExperiment: z.string().min(1).max(300),
});

const SYSTEM_PROMPT = `You are a careful data-analysis assistant inside Patternly, a personal habit-tracking app.
You are given a week's already-calculated metric changes and the user's strongest known pattern, if any. Write a
short, natural-language "what changed" summary using ONLY the numbers given, and suggest one experiment. Rules:
- Never invent numbers.
- Never claim causation between unrelated metrics unless the provided pattern says so.
- Keep it warm and concise, 2-4 sentences for whatChanged.
- Respond with ONLY a JSON object: {"whatChanged": string, "suggestedExperiment": string}`;

export function buildFallbackWeeklyReport(input: WeeklyReportInput): WeeklyReportOutput {
  const entries = Object.entries(input.metrics);
  const summary = entries
    .map(([key, m]) => `${key} ${m.percentChange >= 0 ? 'up' : 'down'} ${Math.abs(m.percentChange)}%`)
    .join(', ');
  return {
    whatChanged: `This week: ${summary || 'not enough data to compare to last week yet'}.`,
    suggestedExperiment: input.strongestPattern
      ? `Consider testing: ${input.strongestPattern.title}`
      : 'Keep checking in daily so we can start suggesting experiments.',
  };
}

export async function generateWeeklyReport(input: WeeklyReportInput): Promise<WeeklyReportOutput> {
  const raw = await callLLM(SYSTEM_PROMPT, JSON.stringify(input));
  const parsed = extractJson<unknown>(raw);
  return outputSchema.parse(parsed);
}
