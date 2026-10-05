import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/password";
import {
  ADMIN_LOGIN_PATH,
  createSessionToken,
  DEFAULT_SESSION_TTL_SECONDS,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session-token";

/**
 * Server-side authentication for the single-owner CMS (Requirement 9;
 * Properties 7 & 8).
 *
 * NODE-ONLY. This module reads the session cookie via `next/headers`, verifies
 * owner credentials with `node:crypto` (through `@/lib/password`), and signs the
 * session token. It is used by Server Components, the admin layout, and Server
 * Actions — never by `middleware.ts` (which uses the Edge-safe
 * `@/lib/session-token` directly).
 *
 * Defense-in-depth (Property 7): middleware guards `/admin` routes, AND every
 * mutating admin action independently calls {@link requireSession}.
 */

/** The session object exposed to callers. Currently identical to the payload. */
export type Session = SessionPayload;

/** Where unauthenticated requests are sent. Re-exported for callers/tests. */
export const LOGIN_PATH = ADMIN_LOGIN_PATH;

/**
 * Constant-time string comparison that does not leak length.
 *
 * `crypto.timingSafeEqual` requires equal-length buffers, so we compare the
 * SHA-256 digests of the two inputs (always 32 bytes) instead of the raw
 * strings. This keeps the email comparison timing-safe regardless of input
 * length (Requirement 9.3 — no oracle that distinguishes "wrong email" from
 * "wrong password" by timing).
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

/**
 * Verify submitted owner credentials against the configured environment values
 * (Requirement 9.2, 9.3).
 *
 * Compares `email` to `ADMIN_EMAIL` (timing-safe, case-insensitive on the email
 * local/domain per usual email semantics) and `password` against
 * `ADMIN_PASSWORD_HASH` (scrypt verify). To avoid a user-enumeration timing
 * oracle, the password hash is always evaluated even when the email does not
 * match, and the two checks are combined at the end.
 *
 * Returns `false` (never throws) when env config is missing or malformed.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedEmail || !expectedHash) {
    return false;
  }

  const emailMatches = timingSafeStringEqual(
    email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase(),
  );

  // Always run the (expensive) password verification so the response time does
  // not reveal whether the email was correct.
  const passwordMatches = await verifyPassword(password, expectedHash);

  return emailMatches && passwordMatches;
}

/** Build a fresh session payload for `email` with the default TTL. */
function buildPayload(email: string, ttlSeconds: number): SessionPayload {
  const iat = Math.floor(Date.now() / 1000);
  return { sub: email, iat, exp: iat + ttlSeconds };
}

/**
 * Establish a session for `email`: sign a token and set the session cookie
 * (Property 8). Cookie attributes:
 *  - `httpOnly`  — not readable by client JS.
 *  - `secure`    — only sent over HTTPS in production.
 *  - `sameSite`  — `lax`, adequate for a same-site admin.
 *  - `path`      — `/` so it is sent to every admin route.
 *  - `maxAge`    — aligned to the token TTL so cookie and token expire together.
 */
export async function createSession(
  email: string,
  ttlSeconds: number = DEFAULT_SESSION_TTL_SECONDS,
): Promise<void> {
  const payload = buildPayload(email, ttlSeconds);
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });
}

/**
 * Clear the session cookie, invalidating access on subsequent requests
 * (Requirement 9.4; Property 8).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Read and verify the current session, or return `null` when absent/invalid
 * (Requirement 9.1). Used by guarded reads that want to branch rather than
 * redirect.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Return the current session or redirect to the login page (Property 7).
 *
 * Used by admin Server Components/pages and re-used by every mutating admin
 * Server Action for defense-in-depth. `redirect` throws internally (a
 * `NEXT_REDIRECT` control-flow error), so this function does not return when
 * unauthenticated.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(LOGIN_PATH);
  }
  return session;
}
