import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for the auth Server Actions (Requirement 9.2, 9.3, 9.4; Property 8).
 *
 * `@/lib/auth` is mocked so these tests focus on the action's branching
 * (presence check, generic error on failure, cookie set only on success) rather
 * than re-testing credential/cookie internals (covered in auth.test.ts).
 */

vi.mock("@/lib/auth", () => ({
  __esModule: true,
  verifyCredentials: vi.fn(),
  createSession: vi.fn(async () => undefined),
  destroySession: vi.fn(async () => undefined),
}));

import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { login, logout } from "./auth";

const mockedVerify = verifyCredentials as unknown as ReturnType<typeof vi.fn>;
const mockedCreate = createSession as unknown as ReturnType<typeof vi.fn>;
const mockedDestroy = destroySession as unknown as ReturnType<typeof vi.fn>;

const GENERIC_ERROR = "Invalid email or password.";

function buildLoginForm(
  overrides: Partial<Record<string, string>> = {},
): FormData {
  const fields: Record<string, string> = {
    email: "owner@example.com",
    password: "an-elite-password-123",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("login — success establishes a session (Property 8)", () => {
  it("sets the session cookie and returns success for valid credentials", async () => {
    mockedVerify.mockResolvedValueOnce(true);

    const result = await login(buildLoginForm());

    expect(result).toEqual({ success: true });
    expect(mockedVerify).toHaveBeenCalledWith(
      "owner@example.com",
      "an-elite-password-123",
    );
    expect(mockedCreate).toHaveBeenCalledTimes(1);
    expect(mockedCreate).toHaveBeenCalledWith("owner@example.com");
  });
});

describe("login — failures return a generic error and set NO cookie (Req 9.3; Property 8)", () => {
  it("returns the generic error and sets no session for invalid credentials", async () => {
    mockedVerify.mockResolvedValueOnce(false);

    const result = await login(buildLoginForm({ password: "wrong" }));

    expect(result).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns the generic error for a missing email without verifying", async () => {
    const result = await login(buildLoginForm({ email: "" }));

    expect(result).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns the generic error for a missing password without verifying", async () => {
    const result = await login(buildLoginForm({ password: "" }));

    expect(result).toEqual({ success: false, formError: GENERIC_ERROR });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("uses the SAME generic message for wrong email and wrong password (no enumeration)", async () => {
    mockedVerify.mockResolvedValue(false);

    const wrongEmail = await login(buildLoginForm({ email: "x@y.z" }));
    const wrongPassword = await login(buildLoginForm({ password: "nope" }));

    expect(wrongEmail).toEqual(wrongPassword);
  });
});

describe("logout — invalidates the session (Req 9.4; Property 8)", () => {
  it("clears the session cookie", async () => {
    await logout();
    expect(mockedDestroy).toHaveBeenCalledTimes(1);
  });
});
