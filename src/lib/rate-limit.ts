/**
 * In-memory sliding-window rate limiter.
 *
 * Good for a single long-running Node server (e.g. `next start` on a VM/container).
 * On serverless or multi-instance deployments each instance keeps its own memory,
 * so the limit is per-instance — swap the store for Redis/Upstash there.
 */

interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the oldest request leaves the window (when blocked). */
  retryAfterSeconds: number;
}

const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
  const hits = new Map<string, number[]>();
  let lastSweep = Date.now();

  /** Drop keys whose timestamps are all outside the window. */
  function sweep(now: number) {
    if (now - lastSweep < windowMs && hits.size < MAX_TRACKED_KEYS) return;
    lastSweep = now;
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t >= windowMs)) hits.delete(key);
    }
    // Hard cap as a memory safety net.
    if (hits.size >= MAX_TRACKED_KEYS) {
      const overflow = hits.size - MAX_TRACKED_KEYS + 1;
      let i = 0;
      for (const key of hits.keys()) {
        if (i++ >= overflow) break;
        hits.delete(key);
      }
    }
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      sweep(now);

      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        const retryAfterMs = windowMs - (now - recent[0]);
        return {
          success: false,
          limit,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
        };
      }

      recent.push(now);
      hits.set(key, recent);
      return { success: true, limit, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
