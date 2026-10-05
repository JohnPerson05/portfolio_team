import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";

import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  ADMIN_LOGIN_PATH,
  createSessionToken,
  DEFAULT_SESSION_TTL_SECONDS,
  REMEMBER_ME_TTL_SECONDS,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session-token";

/**
 * Server-side authentication for the studio CMS.
 *
 * NODE-ONLY. Used by Server Components, layouts, route handlers, and Server
 * Actions — never by `src/proxy.ts` (which uses the Edge-safe
 * `@/lib/session-token` directly and only checks the cookie signature).
 *
 * Defense in depth:
 *  1. `src/proxy.ts` rejects requests without a validly signed cookie.
 *  2. The admin layout calls {@link requireAdmin}.
 *  3. EVERY mutating Server Action / route handler calls {@link requireAdmin}
 *     (or {@link requireSuperAdmin}) itself, which re-loads the AdminUser so a
 *     deactivated or deleted account loses access immediately.
 */

/** The signed-in admin, as exposed to the app. */
export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

/** @deprecated Kept for older callers; prefer {@link AdminIdentity}. */
export type Session = SessionPayload;

export const LOGIN_PATH = ADMIN_LOGIN_PATH;

/**
 * A real scrypt hash of a random string, used to equalize timing when the email
 * does not match any account (so response time does not reveal which emails
 * exist). Computed lazily once per process.
 */
let dummyHash: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(`timing-equalizer-${Math.random()}`);
  return dummyHash;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toIdentity(user: {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}): AdminIdentity {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/**
 * Bootstrap path for existing deployments: before any AdminUser exists, the
 * owner credentials in `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` are accepted once
 * and promoted into a SUPER_ADMIN row. After that, env credentials are ignored.
 */
async function bootstrapFromEnv(
  email: string,
  password: string,
): Promise<AdminIdentity | null> {
  const envEmail = process.env.ADMIN_EMAIL;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (!envEmail || !envHash) return null;

  const passwordMatches = await verifyPassword(password, envHash);
  if (!passwordMatches || normalizeEmail(envEmail) !== email) return null;

  const existing = await prisma.adminUser.count();
  if (existing > 0) return null;

  const user = await prisma.adminUser.create({
    data: {
      email,
      passwordHash: envHash,
      name: email.split("@")[0] ?? "Owner",
      role: "SUPER_ADMIN",
    },
  });
  return toIdentity(user);
}

/**
 * Verify credentials. Returns the identity on success, `null` otherwise. Never
 * reveals whether the email or the password was wrong, and always performs one
 * scrypt verification so timing is uniform.
 */
export async function authenticate(
  rawEmail: string,
  password: string,
): Promise<AdminIdentity | null> {
  const email = normalizeEmail(rawEmail);
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    await verifyPassword(password, await getDummyHash());
    return bootstrapFromEnv(email, password);
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches || !user.isActive) return null;

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  return toIdentity(user);
}

/**
 * Back-compat wrapper for older callers/tests.
 * @deprecated Use {@link authenticate}.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  return (await authenticate(email, password)) !== null;
}

/**
 * Establish a session cookie. Without "remember me" the cookie is a browser
 * session cookie backed by a 12h token; with it, a 30-day persistent cookie.
 */
export async function createSession(
  user: AdminIdentity,
  { remember = false }: { remember?: boolean } = {},
): Promise<void> {
  const ttl = remember ? REMEMBER_ME_TTL_SECONDS : DEFAULT_SESSION_TTL_SECONDS;
  const iat = Math.floor(Date.now() / 1000);
  const token = await createSessionToken({
    sub: user.email,
    uid: user.id,
    role: user.role,
    iat,
    exp: iat + ttl,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: ttl } : {}),
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** The verified token payload, or `null`. Does NOT hit the database. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * The signed-in, still-active admin, or `null`. Memoized per request so the
 * layout and every nested component share one lookup.
 */
export const getCurrentAdmin = cache(
  async (): Promise<AdminIdentity | null> => {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.adminUser.findUnique({
      where: { id: session.uid },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) return null;
    return toIdentity(user);
  },
);

/** The current admin, or redirect to the login page. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

/** Like {@link requireAdmin} but also requires the SUPER_ADMIN role. */
export async function requireSuperAdmin(): Promise<AdminIdentity> {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") {
    throw new Error("Only a super admin can do this.");
  }
  return admin;
}

/** @deprecated Alias kept for existing actions; prefer {@link requireAdmin}. */
export const requireSession = requireAdmin;
