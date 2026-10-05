import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Server-side auth helpers. Password hashing and token signing run for real;
 * `next/headers`, `next/navigation`, and Prisma are mocked (an in-memory
 * AdminUser table) so the helpers run without a request or database.
 */

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

const cookieStore = new Map<string, { name: string; value: string }>();
const cookieSet = vi.fn((name: string, value: string, _attrs?: Record<string, unknown>) => {
  cookieStore.set(name, { name, value });
});
const cookieDelete = vi.fn((name: string) => cookieStore.delete(name));
vi.mock("next/headers", () => ({
  __esModule: true,
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieStore.get(name),
    set: cookieSet,
    delete: cookieDelete,
  })),
}));

interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "SUPER_ADMIN" | "EDITOR";
  isActive: boolean;
  lastLoginAt: Date | null;
}
const users: UserRow[] = [];
vi.mock("@/lib/prisma", () => {
  const client = {
    adminUser: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) =>
        users.find((u) => (where.id ? u.id === where.id : u.email === where.email)) ?? null,
      ),
      count: vi.fn(async () => users.length),
      create: vi.fn(async ({ data }: { data: Omit<UserRow, "id" | "isActive" | "lastLoginAt"> }) => {
        const row = { id: `u${users.length + 1}`, isActive: true, lastLoginAt: null, ...data } as UserRow;
        users.push(row);
        return row;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<UserRow> }) => {
        const row = users.find((u) => u.id === where.id)!;
        Object.assign(row, data);
        return row;
      }),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

import { SESSION_COOKIE_NAME } from "@/lib/session-token";
import { hashPassword } from "@/lib/password";
import {
  authenticate,
  createSession,
  destroySession,
  getCurrentAdmin,
  getSession,
  LOGIN_PATH,
  requireAdmin,
  requireSuperAdmin,
} from "./auth";

const PASSWORD = "correct-horse-battery-staple";
let hash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  cookieStore.clear();
  users.length = 0;
  process.env.AUTH_SECRET = "auth-test-secret-value-please-ignore";
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD_HASH;
  hash ??= await hashPassword(PASSWORD);
});

async function addUser(overrides: Partial<UserRow> = {}): Promise<UserRow> {
  const row: UserRow = {
    id: `u${users.length + 1}`,
    email: "owner@example.com",
    passwordHash: hash,
    name: "Owner",
    role: "SUPER_ADMIN",
    isActive: true,
    lastLoginAt: null,
    ...overrides,
  };
  users.push(row);
  return row;
}

describe("authenticate", () => {
  it("accepts the right password (email is case-insensitive) and records the login", async () => {
    await addUser();
    const admin = await authenticate("  Owner@Example.com ", PASSWORD);
    expect(admin).toMatchObject({ id: "u1", role: "SUPER_ADMIN" });
    expect(users[0]?.lastLoginAt).toBeInstanceOf(Date);
  });

  it("rejects a wrong password, an unknown email, and a deactivated account", async () => {
    await addUser();
    await addUser({ id: "u2", email: "gone@example.com", isActive: false });
    expect(await authenticate("owner@example.com", "wrong-password")).toBeNull();
    expect(await authenticate("nobody@example.com", PASSWORD)).toBeNull();
    expect(await authenticate("gone@example.com", PASSWORD)).toBeNull();
  });

  it("bootstraps the first super admin from env credentials when no admin exists", async () => {
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.ADMIN_PASSWORD_HASH = hash;
    const admin = await authenticate("owner@example.com", PASSWORD);
    expect(admin?.role).toBe("SUPER_ADMIN");
    expect(users).toHaveLength(1);
  });

  it("ignores env credentials once an admin exists", async () => {
    await addUser({ email: "someone@example.com" });
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.ADMIN_PASSWORD_HASH = hash;
    expect(await authenticate("owner@example.com", PASSWORD)).toBeNull();
    expect(users).toHaveLength(1);
  });
});

describe("sessions", () => {
  it("sets a hardened cookie that resolves back to the admin", async () => {
    const user = await addUser();
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    const [name, , attributes] = cookieSet.mock.calls[0] as unknown as [string, string, Record<string, unknown>];
    expect(name).toBe(SESSION_COOKIE_NAME);
    expect(attributes).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(attributes.maxAge).toBeUndefined(); // browser-session cookie without "remember me"

    expect((await getSession())?.uid).toBe(user.id);
    expect((await getCurrentAdmin())?.email).toBe(user.email);
  });

  it("remember me makes the cookie persistent", async () => {
    const user = await addUser();
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, { remember: true });
    const attributes = cookieSet.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(attributes.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it("a deactivated admin loses access even with a valid cookie", async () => {
    const user = await addUser();
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    user.isActive = false;
    expect(await getCurrentAdmin()).toBeNull();
  });

  it("destroySession clears the cookie", async () => {
    const user = await addUser();
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    await destroySession();
    expect(cookieDelete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(await getSession()).toBeNull();
  });

  it("rejects a tampered cookie", async () => {
    cookieStore.set(SESSION_COOKIE_NAME, { name: SESSION_COOKIE_NAME, value: "tampered.token" });
    expect(await getSession()).toBeNull();
  });
});

describe("guards", () => {
  it("requireAdmin redirects to the login page without a session", async () => {
    await expect(requireAdmin()).rejects.toBeInstanceOf(RedirectError);
    expect(redirectMock).toHaveBeenCalledWith(LOGIN_PATH);
  });

  it("requireSuperAdmin refuses editors", async () => {
    const user = await addUser({ role: "EDITOR" });
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    await expect(requireSuperAdmin()).rejects.toThrow(/super admin/);
  });
});
