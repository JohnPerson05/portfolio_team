/**
 * In-memory fixed-window rate limiter (Requirement 8.7; supports Property 4).
 *
 * This is a deliberately simple, dependency-free limiter suited to a
 * single-instance / MVP deployment. State lives in a module-level `Map`, so it
 * is per-process and resets on restart — it does NOT coordinate across multiple
 * server instances or serverless cold starts.
 *
 * PRODUCTION NOTE: for a horizontally-scaled or serverless deployment, replace
 * the in-memory store with a shared/distributed counter (e.g. Upstash Redis,
 * Vercel KV, or Redis `INCR` + `EXPIRE`). The {@link checkRateLimit} contract
 * below is intentionally storage-agnostic so the implementation can be swapped
 * without touching callers — an alternate store can be injected per-call via
 * {@link RateLimitOptions.store} for tests or for a distributed backend.
 *
 * Algorithm: fixed window. Each key tracks a `count` and a `resetAt` timestamp.
 * The first request in a window seeds the window; subsequent requests increment
 * the count until `resetAt`, after which the window rolls over.
 */

/** Default number of allowed requests per window. */
export const DEFAULT_RATE_LIMIT = 5;
/** Default window length in milliseconds (1 minute). */
export const DEFAULT_WINDOW_MS = 60_000;

/** A single key's window bookkeeping. */
export interface RateLimitEntry {
  /** Requests counted in the current window. */
  count: number;
  /** Epoch milliseconds at which the current window expires. */
  resetAt: number;
}

/** Pluggable backing store. The default is a module-level in-memory `Map`. */
export type RateLimitStore = Map<string, RateLimitEntry>;

export interface RateLimitOptions {
  /** Max requests allowed within the window. Defaults to {@link DEFAULT_RATE_LIMIT}. */
  limit?: number;
  /** Window length in milliseconds. Defaults to {@link DEFAULT_WINDOW_MS}. */
  windowMs?: number;
  /**
   * Injectable store. Defaults to the shared module-level store. Tests (or a
   * future distributed backend adapter) can pass their own to isolate state.
   */
  store?: RateLimitStore;
  /** Injectable clock, primarily for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
}

export interface RateLimitResult {
  /** Whether this request is permitted under the current window. */
  allowed: boolean;
  /** Requests remaining in the current window (never negative). */
  remaining: number;
  /** Epoch milliseconds at which the current window resets. */
  resetAt: number;
}

/** Shared, process-wide store used when no store is injected. */
const defaultStore: RateLimitStore = new Map();

/**
 * Record and evaluate a request for `key` (Requirement 8.7).
 *
 * Increments the key's counter within the active window and reports whether the
 * request is allowed. When a window has expired (or none exists yet) a fresh
 * window is started. Calling this function counts the request, so callers should
 * invoke it exactly once per request they wish to meter.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = options.limit ?? DEFAULT_RATE_LIMIT;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const store = options.store ?? defaultStore;
  const now = (options.now ?? Date.now)();

  const existing = store.get(key);

  // Start a new window when there is no entry or the prior window has elapsed.
  if (existing === undefined || now >= existing.resetAt) {
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: entry.resetAt,
    };
  }

  // Within the active window: count this request and decide.
  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Test/maintenance helper: clear all rate-limit state in the default store.
 *
 * Tests should call this between cases to avoid cross-test leakage. Not intended
 * for production request paths.
 */
export function __resetRateLimit(): void {
  defaultStore.clear();
}
