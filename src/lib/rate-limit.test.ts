import { afterEach, describe, expect, it } from "vitest";

import {
  __resetRateLimit,
  checkRateLimit,
  DEFAULT_RATE_LIMIT,
  type RateLimitStore,
} from "./rate-limit";

afterEach(() => {
  // Keep the shared default store clean for any test that uses it.
  __resetRateLimit();
});

describe("checkRateLimit — fixed window", () => {
  it("allows requests up to the limit, then blocks", () => {
    const store: RateLimitStore = new Map();
    const limit = 3;
    const options = { limit, windowMs: 1000, store, now: () => 1000 };

    const r1 = checkRateLimit("ip", options);
    const r2 = checkRateLimit("ip", options);
    const r3 = checkRateLimit("ip", options);
    const r4 = checkRateLimit("ip", options);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r4.allowed).toBe(false);
  });

  it("reports remaining count and resetAt", () => {
    const store: RateLimitStore = new Map();
    const first = checkRateLimit("ip", {
      limit: 2,
      windowMs: 5000,
      store,
      now: () => 1000,
    });

    expect(first.remaining).toBe(1);
    expect(first.resetAt).toBe(6000);

    const second = checkRateLimit("ip", {
      limit: 2,
      windowMs: 5000,
      store,
      now: () => 2000,
    });
    // resetAt stays anchored to the window start, not the latest request.
    expect(second.remaining).toBe(0);
    expect(second.resetAt).toBe(6000);
  });

  it("starts a fresh window after the previous one expires", () => {
    const store: RateLimitStore = new Map();
    const make = (now: number) =>
      checkRateLimit("ip", { limit: 1, windowMs: 1000, store, now: () => now });

    expect(make(1000).allowed).toBe(true);
    // Same window: blocked.
    expect(make(1500).allowed).toBe(false);
    // Window elapsed at now >= resetAt (2000): allowed again.
    expect(make(2000).allowed).toBe(true);
  });

  it("meters keys independently", () => {
    const store: RateLimitStore = new Map();
    const options = { limit: 1, windowMs: 1000, store, now: () => 1000 };

    expect(checkRateLimit("a", options).allowed).toBe(true);
    expect(checkRateLimit("b", options).allowed).toBe(true);
    expect(checkRateLimit("a", options).allowed).toBe(false);
  });

  it("uses sensible defaults and isolates state via __resetRateLimit", () => {
    for (let i = 0; i < DEFAULT_RATE_LIMIT; i += 1) {
      expect(checkRateLimit("default-key").allowed).toBe(true);
    }
    expect(checkRateLimit("default-key").allowed).toBe(false);

    __resetRateLimit();
    // After reset the same key is allowed again.
    expect(checkRateLimit("default-key").allowed).toBe(true);
  });
});
