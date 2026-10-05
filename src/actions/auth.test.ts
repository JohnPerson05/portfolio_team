import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Login/logout Server Actions. `@/lib/auth` is mocked so these tests cover the
 * action's branching (presence check, generic errors, rate limit, remember me)
 * rather than credential internals (see `src/lib/auth.test.ts`).
 */

vi.mock("@/lib/auth", () => ({
  __esModule: true,
  authenticate: vi.fn(),
  createSession: vi.fn(async () => undefined),
  destroySession: vi.fn(async () => undefined),
}));
vi.mock("next/headers", () => ({
  __esModule: true,
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "203.0.113.7" })),
}));
vi.mock("@/server/admin/activity", () => ({ __esModule: true, logActivity: vi.fn() }));

import { authenticate, createSession, destroySession } from "@/lib/auth";
import { __resetRateLimit } from "@/lib/rate-limit";
import { login, logout } from "./auth";

type Mock = ReturnType<typeof vi.fn>;
const mockedAuthenticate = authenticate as unknown as Mock;
const mockedCreate = createSession as unknown as Mock;
const mockedDestroy = destroySession as unknown as Mock;

const GENERIC_ERROR = "Invalid email or password.";
const ADMIN = { id: "u1", email: "owner@example.com", name: "Owner", role: "SUPER_ADMIN" };

function form(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries({ email: "owner@example.com", password: "an-elite-password-123", ...overrides })) {
    data.set(k, v);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimit();
});

describe("login", () => {
  it("creates a session for valid credentials", async () => {
    mockedAuthenticate.mockResolvedValueOnce(ADMIN);
    expect(await login(form())).toEqual({ success: true });
    expect(mockedAuthenticate).toHaveBeenCalledWith("owner@example.com", "an-elite-password-123");
    expect(mockedCreate).toHaveBeenCalledWith(ADMIN, { remember: false });
  });

  it("passes remember me through", async () => {
    mockedAuthenticate.mockResolvedValueOnce(ADMIN);
    await login(form({ remember: "on" }));
    expect(mockedCreate).toHaveBeenCalledWith(ADMIN, { remember: true });
  });

  it("returns the same generic error for bad credentials and missing fields", async () => {
    mockedAuthenticate.mockResolvedValueOnce(null);
    expect(await login(form({ password: "wrong" }))).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(await login(form({ email: "" }))).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(await login(form({ password: "" }))).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("rate limits repeated attempts from one IP", async () => {
    mockedAuthenticate.mockResolvedValue(null);
    for (let i = 0; i < 10; i += 1) await login(form({ password: `wrong-${i}` }));
    const result = await login(form());
    expect(result.success).toBe(false);
    if (!result.success) expect(result.formError).toMatch(/Too many/);
    expect(mockedAuthenticate).toHaveBeenCalledTimes(10);
  });
});

describe("logout", () => {
  it("destroys the session", async () => {
    await logout();
    expect(mockedDestroy).toHaveBeenCalledTimes(1);
  });
});
