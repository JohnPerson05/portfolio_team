import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createSessionToken,
  isAuthorizedRequest,
  verifySessionToken,
  type SessionPayload,
} from "./session-token";

/**
 * Tests for the Edge-safe signed session token (Properties 7 & 8).
 *
 * Covers: round-trip integrity, tamper detection, and expiry — the three
 * guarantees the middleware and `getSession` rely on.
 */

const SECRET = "test-secret-value-please-ignore-32bytes";

/** Build a payload issued `iat` and expiring `ttl` seconds later. */
function makePayload(
  overrides: Partial<SessionPayload> = {},
): SessionPayload {
  const iat = 1_700_000_000;
  return { sub: "owner@example.com", iat, exp: iat + 3600, ...overrides };
}

beforeEach(() => {
  process.env.AUTH_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.AUTH_SECRET;
});

describe("createSessionToken / verifySessionToken — round-trip (Property 8)", () => {
  it("verifies a freshly signed token back to the same payload", async () => {
    const payload = makePayload();
    const token = await createSessionToken(payload);

    // Verify with `now` inside the validity window.
    const result = await verifySessionToken(token, { now: payload.iat + 1 });
    expect(result).toEqual(payload);
  });

  it("produces a token of the form `payload.signature`", async () => {
    const token = await createSessionToken(makePayload());
    expect(token.split(".")).toHaveLength(2);
  });
});

describe("verifySessionToken — tamper detection (Property 7)", () => {
  it("rejects a token whose payload has been altered", async () => {
    const token = await createSessionToken(makePayload());
    const [, signature] = token.split(".");

    // Re-encode a different payload but keep the original signature.
    const forgedPayload = Buffer.from(
      JSON.stringify(makePayload({ sub: "attacker@evil.example" })),
      "utf8",
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const forged = `${forgedPayload}.${signature}`;

    const result = await verifySessionToken(forged, { now: 1_700_000_001 });
    expect(result).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(makePayload(), {
      secret: "a-totally-different-secret-value-here",
    });
    const result = await verifySessionToken(token, { now: 1_700_000_001 });
    expect(result).toBeNull();
  });

  it("rejects a malformed token (no signature segment)", async () => {
    const result = await verifySessionToken("not-a-valid-token");
    expect(result).toBeNull();
  });

  it("rejects an empty/undefined token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
});

describe("verifySessionToken — expiry (Property 8)", () => {
  it("rejects a token whose exp is in the past", async () => {
    const payload = makePayload({ exp: 1_700_000_000 + 100 });
    const token = await createSessionToken(payload);

    // `now` is after exp.
    const result = await verifySessionToken(token, { now: payload.exp + 1 });
    expect(result).toBeNull();
  });

  it("rejects a token exactly at exp (exp is exclusive)", async () => {
    const payload = makePayload({ exp: 1_700_000_500 });
    const token = await createSessionToken(payload);

    const result = await verifySessionToken(token, { now: payload.exp });
    expect(result).toBeNull();
  });
});

describe("isAuthorizedRequest", () => {
  it("returns true for a valid, unexpired token", async () => {
    const payload = makePayload();
    const token = await createSessionToken(payload);
    expect(await isAuthorizedRequest(token, { now: payload.iat + 1 })).toBe(
      true,
    );
  });

  it("returns false for a missing token", async () => {
    expect(await isAuthorizedRequest(undefined)).toBe(false);
  });

  it("returns false for an expired token", async () => {
    const payload = makePayload();
    const token = await createSessionToken(payload);
    expect(await isAuthorizedRequest(token, { now: payload.exp + 1 })).toBe(
      false,
    );
  });
});
