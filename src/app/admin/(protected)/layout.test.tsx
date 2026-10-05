import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

/**
 * Integration tests for the guarded admin shell (Requirement 9.1; Property 7).
 *
 * The layout is an async Server Component that calls `requireSession()` for
 * defense-in-depth. We mock the auth module so we can drive the two branches:
 *  - no session → `requireSession` redirects (throws NEXT_REDIRECT); the
 *    protected tree must NOT render (no data exposure).
 *  - valid session → the shell renders with the admin navigation.
 *
 * `requireSession` redirects via `next/navigation` redirect(), which throws a
 * NEXT_REDIRECT control-flow error in Next; we emulate that here (mirrors the
 * auth/blog page tests).
 */

// --- Mock next/navigation (redirect + usePathname) --------------------------
class RedirectError extends Error {
  constructor(public readonly destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
    this.name = "RedirectError";
  }
}
const redirectMock = vi.fn((destination: string) => {
  throw new RedirectError(destination);
});
vi.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (destination: string) => redirectMock(destination),
  usePathname: () => "/admin",
}));

// --- Mock the auth module so the layout's guard is controllable -------------
vi.mock("@/lib/auth", () => ({
  __esModule: true,
  requireSession: vi.fn(),
}));

// --- Mock the logout action used by the nav's client island -----------------
vi.mock("@/actions/auth", () => ({
  __esModule: true,
  logout: vi.fn(async () => undefined),
}));

import { requireSession } from "@/lib/auth";
import { ADMIN_NAV_LINKS } from "@/features/admin";
import AdminProtectedLayout from "./layout";

const mockedRequireSession = requireSession as unknown as ReturnType<
  typeof vi.fn
>;

const LOGIN_PATH = "/admin/login";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Admin shell — unauthenticated access is rejected (Req 9.1; Property 7)", () => {
  it("redirects to /admin/login and never renders protected content when there is no session", async () => {
    // Simulate requireSession() finding no session → it redirects.
    mockedRequireSession.mockImplementationOnce(async () => {
      redirectMock(LOGIN_PATH);
    });

    await expect(
      AdminProtectedLayout({
        children: <div>secret admin content</div>,
      }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith(LOGIN_PATH);
  });
});

describe("Admin shell — authenticated access renders the shell (Req 9.2)", () => {
  it("renders the admin navigation, all nav links, a logout control, and the page content", async () => {
    mockedRequireSession.mockResolvedValueOnce({
      sub: "owner@example.com",
      iat: 0,
      exp: 9_999_999_999,
    });

    const ui = await AdminProtectedLayout({
      children: <div>dashboard body</div>,
    });
    render(ui);

    // The admin nav landmark is present...
    const nav = screen.getByRole("navigation", { name: "Admin" });
    expect(nav).toBeInTheDocument();

    // ...with every primary admin link pointing at the right route.
    for (const link of ADMIN_NAV_LINKS) {
      expect(
        within(nav).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }

    // ...a logout control...
    expect(
      within(nav).getByRole("button", { name: /log out/i }),
    ).toBeInTheDocument();

    // ...and the guarded page content.
    expect(screen.getByText("dashboard body")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
