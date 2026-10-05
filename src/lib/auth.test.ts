import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for server-side auth helpers (Requirement 9; Properties 7 & 8).
 *
 * `node:crypto` (password) and Web Crypto (token signing) run for real; only
 * `next/headers` cookies() and `next/navigation` redirect() are mocked so the
 * helpers can be exercised without a request/SSR context.
 */

// --- Mock next/navigation redirect ---------------------------------------
// redirect() throws in Next (NEXT_REDIRECT control flow); emulate that so
// requireSession() stops executing on the unauthenticated path.
class RedirectError extends Error {
  constructor(public readonly destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}
const redirectMock = vi.fn((destination: string) => {
  throw new RedirectError(destination);
});
vi.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (destination: string) => redirectMock(destination),
}));

// --- Mock next/headers cookies() with a stateful in-memory store ----------
interface StoredCookie {
  name: string;
  value: string;
}
const cookieStore = new Map<string, StoredCookie>();
const cookieSet = vi.fn((name: string, value: string) => {
  cookieStore.set(name, { name, value });
});
const cookieDelete = vi.fn((name: string) => {
  cookieStore.delete(name);
});
const cookieGet = vi.fn((name: string) => cookieStore.get(name));
vi.mock("next/headers", () => ({
  __esModule: true,
  cookies: vi.fn(async () => ({
    get: cookieGet,
    set: cookieSet,
    delete: cookieDelete,
  })),
}));

import { SESSION_COOKIE_NAME } from "@/lib/session-token";
import { hashPassword } from "@/lib/password";
import {
  createSession,
  destroySession,
  getSession,
  LOGIN_PATH,
  requireSession,
  verifyCredentials,
} from "./auth";

const SECRET = "auth-test-secret-value-please-ignore";
const OWNER_EMAIL = "owner@example.com";
const OWNER_PASSWORD = "an-elite-password-123";

beforeEach(async () => {
  vi.clearAllMocks();
  cookieStore.clear();
  process.env.AUTH_SECRET = SECRET;
  process.env.ADMIN_EMAIL = OWNER_EMAIL;
  process.env.ADMIN_PASSWORD_HASH = await hashPassword(OWNER_PASSWORD);
});

afterEach(() => {
  delete process.env.AUTH_SECRET;
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD_HASH;
});

describe("verifyCredentials (Requirement 9.2, 9.3)", () => {
  it("accepts the correct email + password", async () => {
    expect(await verifyCredentials(OWNER_EMAIL, OWNER_PASSWORD)).toBe(true);
  });

  it("accepts the email case-insensitively", async () => {
    expect(await verifyCredentials("OWNER@Example.com", OWNER_PASSWORD)).toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    expect(await verifyCredentials(OWNER_EMAIL, "wrong-password")).toBe(false);
  });

  it("rejects a wrong email", async () => {
    expect(await verifyCredentials("intruder@evil.example", OWNER_PASSWORD)).toBe(
      false,
    );
  });

  it("rejects when env config is missing", async () => {
    delete process.env.ADMIN_EMAIL;
    expect(await verifyCredentials(OWNER_EMAIL, OWNER_PASSWORD)).toBe(false);
  });
});

describe("createSession / getSession / destroySession (Property 8)", () => {
  it("getSession returns null when no cookie is present", async () => {
    expect(await getSession()).toBeNull();
  });

  it("createSession sets a cookie that getSession can read back", async () => {
    await createSession(OWNER_EMAIL);

    expect(cookieSet).toHaveBeenCalledTimes(1);
    const [name, , attributes] = cookieSet.mock.calls[0] as unknown as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(name).toBe(SESSION_COOKIE_NAME);
    // Cookie hardening attributes (Requirement 9).
    expect(attributes).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(typeof attributes.maxAge).toBe("number");

    const session = await getSession();
    expect(session?.sub).toBe(OWNER_EMAIL);
  });

  it("getSession returns null for an invalid cookie value", async () => {
    cookieStore.set(SESSION_COOKIE_NAME, {
      name: SESSION_COOKIE_NAME,
      value: "tampered.token",
    });
    expect(await getSession()).toBeNull();
  });

  it("destroySession clears the cookie so getSession returns null", async () => {
    await createSession(OWNER_EMAIL);
    expect(await getSession()).not.toBeNull();

    await destroySession();
    expect(cookieDelete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(await getSession()).toBeNull();
  });
});

describe("requireSession (Property 7)", () => {
  it("returns the session when a valid cookie is present", async () => {
    await createSession(OWNER_EMAIL);
    const session = await requireSession();
    expect(session.sub).toBe(OWNER_EMAIL);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to the login page when no session exists", async () => {
    await expect(requireSession()).rejects.toBeInstanceOf(RedirectError);
    expect(redirectMock).toHaveBeenCalledWith(LOGIN_PATH);
  });

  it("redirects when the session cookie is invalid", async () => {
    cookieStore.set(SESSION_COOKIE_NAME, {
      name: SESSION_COOKIE_NAME,
      value: "garbage",
    });
    await expect(requireSession()).rejects.toBeInstanceOf(RedirectError);
    expect(redirectMock).toHaveBeenCalledWith(LOGIN_PATH);
  });
});
