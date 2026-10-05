import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

/**
 * Integration tests for the admin contacts view (Task 24; Requirement 12,
 * Requirement 9.1; Correctness Properties 7 & 10).
 *
 *  (a) submissions are rendered newest-first (Property 10 / Req 12.3),
 *  (b) an empty state renders when there are none (Req 12.2), and
 *  (c) the route is guarded — the contacts page is a sibling under the
 *      `app/admin/(protected)` route group, so it inherits the guarded layout
 *      whose `requireSession()` redirects unauthenticated requests before any
 *      content renders (Req 9.1 / Property 7).
 */

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
  usePathname: () => "/admin/contacts",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth", () => ({
  __esModule: true,
  requireSession: vi.fn(),
}));

vi.mock("@/actions/auth", () => ({
  __esModule: true,
  logout: vi.fn(async () => undefined),
}));

vi.mock("@/actions/contacts", () => ({
  __esModule: true,
  deleteContact: vi.fn(),
  markContactRead: vi.fn(),
}));

vi.mock("@/features/admin/contacts/data", () => ({
  __esModule: true,
  getContactSubmissions: vi.fn(),
}));

import { requireSession } from "@/lib/auth";
import { getContactSubmissions } from "@/features/admin/contacts/data";
import AdminProtectedLayout from "../layout";
import AdminContactsPage from "./page";

const mockedRequireSession = requireSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockedGetContacts = getContactSubmissions as unknown as ReturnType<
  typeof vi.fn
>;

const LOGIN_PATH = "/admin/login";

function makeSubmission(
  id: string,
  submittedAt: string,
  company?: string,
  attachmentUrls: string[] = [],
  read = false,
) {
  return {
    id,
    name: `Name ${id}`,
    email: `${id}@example.com`,
    company,
    message: `Message ${id}`,
    submittedAt,
    attachmentUrls,
    read,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AdminContactsPage — submissions listed newest-first (Property 10; Req 12.1, 12.3)", () => {
  it("renders a row per submission, in the order returned, with all fields", async () => {
    mockedGetContacts.mockResolvedValueOnce([
      makeSubmission("newest", "2025-02-20T09:15:00.000Z", "Acme Corp"),
      makeSubmission("middle", "2024-06-15T12:30:00.000Z"),
      makeSubmission("oldest", "2024-01-01T08:00:00.000Z"),
    ]);

    const ui = await AdminContactsPage();
    render(ui);

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(["Name newest", "Name middle", "Name oldest"]);

    expect(
      screen.getByRole("link", { name: /name newest/i }),
    ).toHaveAttribute("href", "/admin/contacts/newest");
    expect(screen.getByText("Message newest")).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    const time = screen.getByText(/Feb 20, 2025/);
    expect(time).toHaveAttribute("dateTime", "2025-02-20T09:15:00.000Z");
    expect(screen.getAllByText("Unread")).toHaveLength(3);

    expect(screen.queryByText(/no submissions yet/i)).not.toBeInTheDocument();
  });

  it("shows a file count and links to the inquiry that has attachments", async () => {
    mockedGetContacts.mockResolvedValueOnce([
      makeSubmission("with-files", "2025-02-20T09:15:00.000Z", "Acme Corp", [
        "https://example.blob.vercel-storage.com/contact-ideas/123-0-brief.pdf",
      ]),
    ]);

    const ui = await AdminContactsPage();
    render(ui);

    expect(screen.getByText("1 file")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /name with-files/i }),
    ).toHaveAttribute("href", "/admin/contacts/with-files");
  });
});

describe("AdminContactsPage — empty state (Req 12.2)", () => {
  it("renders an empty state and no inbox list when there are no submissions", async () => {
    mockedGetContacts.mockResolvedValueOnce([]);

    const ui = await AdminContactsPage();
    render(ui);

    expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("Admin contacts route is guarded (Req 9.1; Property 7)", () => {
  it("redirects to login and renders no content when unauthenticated", async () => {
    mockedRequireSession.mockImplementationOnce(async () => {
      redirectMock(LOGIN_PATH);
    });

    await expect(
      AdminProtectedLayout({ children: <div>contacts content</div> }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith(LOGIN_PATH);
  });

  it("renders the guarded shell around the contacts content when authenticated", async () => {
    mockedRequireSession.mockResolvedValueOnce({
      sub: "owner@example.com",
      iat: 0,
      exp: 9_999_999_999,
    });

    const ui = await AdminProtectedLayout({
      children: <div>contacts content</div>,
    });
    render(ui);

    const nav = screen.getByRole("navigation", { name: "Admin" });
    expect(within(nav).getByRole("link", { name: "Contacts" })).toHaveAttribute(
      "href",
      "/admin/contacts",
    );

    expect(screen.getByText("contacts content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
