/**
 * Lightweight in-memory rate limiter to avoid exhausting OpenAI quota.
 *
 * Configurable via env:
 * - OPENAI_MAX_REQUESTS_PER_MINUTE (default: 30)
 */

const WINDOW_MS = 60_000;
const maxRequestsPerMinute = Number(process.env.OPENAI_MAX_REQUESTS_PER_MINUTE ?? '30');

let windowStart = Date.now();
let requestCount = 0;

export function enforceOpenAiRateLimit(operation: string) {
  if (!maxRequestsPerMinute || Number.isNaN(maxRequestsPerMinute)) return;

  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    requestCount = 0;
  }

  if (requestCount >= maxRequestsPerMinute) {
    const error = new Error(
      `OpenAI rate limit reached (${maxRequestsPerMinute}/min) while running ${operation}.`
    );
    (error as any).code = 'rate_limit_exceeded';
    throw error;
  }

  requestCount += 1;
}
