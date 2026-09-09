import { env } from '../../config/env';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export class AIServiceError extends Error {}

/**
 * Thin wrapper around the Anthropic Messages API. Kept provider-agnostic at the call
 * site (callers pass plain system/user text and get plain text back) so a different
 * provider can be swapped in here later without touching pattern/experiment/report code.
 */
export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!env.aiApiKey) {
    throw new AIServiceError('AI_API_KEY is not configured');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.aiApiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: env.aiModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AIServiceError(`LLM request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((block) => block.type === 'text')?.text;
  if (!text) {
    throw new AIServiceError('LLM response contained no text content');
  }
  return text;
}

/** Extracts the first top-level JSON object from a text blob, tolerating markdown fences. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new AIServiceError('No JSON object found in LLM response');
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
