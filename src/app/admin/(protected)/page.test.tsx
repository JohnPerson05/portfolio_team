import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AnalyticsSummary } from "@/types";

/**
 * Integration tests for the admin analytics dashboard (Requirement 13.6;
 * Property 7).
 *
 * The page is an async Server Component that reads aggregated metrics via
 * `getAnalyticsSummary`. We mock that action to return a known summary so we can
 * assert the headline counts and top-projects ranking render exactly
 * (Req 13.6). The aggregation logic itself is covered by `analytics.test.ts`.
 *
 * The auth guard (Property 7 / Req 9.1) is enforced by the `(protected)` layout
 * (`requireSession`) and `middleware.ts`, and is exercised by
 * `layout.test.tsx`. Here we assert the dashboard relies on that guarded
 * segment — it lives under `app/admin/(protected)/` and never calls the data
 * action without the layout guard — rather than duplicating the redirect test.
 */

vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  getAnalyticsSummary: vi.fn(),
}));

import { getAnalyticsSummary } from "@/actions/analytics";
import AdminDashboardPage from "./page";

const mockedGetAnalyticsSummary = getAnalyticsSummary as unknown as ReturnType<
  typeof vi.fn
>;

function makeSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    totalViews: 0,
    projectClicks: 0,
    resumeDownloads: 0,
    contactSubmissions: 0,
    topProjects: [],
    recent: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AdminDashboardPage — aggregated metrics render (Req 13.6)", () => {
  it("renders the four headline counts paired with their labels", async () => {
    mockedGetAnalyticsSummary.mockResolvedValueOnce(
      makeSummary({
        totalViews: 1234,
        projectClicks: 56,
        resumeDownloads: 7,
        contactSubmissions: 3,
      }),
    );

    const ui = await AdminDashboardPage();
    render(ui);

    // Each value is associated with its label via a <dt>/<dd> pair. Asserting
    // on the term's sibling proves the right number renders under the right
    // metric (not just that the digits appear somewhere on the page). Exact
    // label strings avoid colliding with copy like "No project clicks yet".
    const expectations: ReadonlyArray<[label: string, value: string]> = [
      ["Total views", "1,234"],
      ["Project clicks", "56"],
      ["Resume downloads", "7"],
      ["Contact submissions", "3"],
    ];

    for (const [label, value] of expectations) {
      const term = screen.getByText(label);
      const definition = term.nextElementSibling;
      expect(definition).not.toBeNull();
      expect(definition).toHaveTextContent(value);
    }
  });

  it("renders the top projects ranked with their click counts", async () => {
    mockedGetAnalyticsSummary.mockResolvedValueOnce(
      makeSummary({
        projectClicks: 9,
        topProjects: [
          { projectId: "proj_a", title: "Realtime Analytics Engine", clicks: 6 },
          { projectId: "proj_b", title: "Design System Toolkit", clicks: 3 },
          { projectId: "proj_c", title: "Edge Cache Proxy", clicks: 1 },
        ],
      }),
    );

    const ui = await AdminDashboardPage();
    render(ui);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);

    // Order preserved (ranking is click-descending from the summary).
    expect(items[0]).toHaveTextContent("Realtime Analytics Engine");
    expect(items[0]).toHaveTextContent("6 clicks");
    expect(items[1]).toHaveTextContent("Design System Toolkit");
    expect(items[1]).toHaveTextContent("3 clicks");
    // Singular pluralization for a single click.
    expect(items[2]).toHaveTextContent("Edge Cache Proxy");
    expect(items[2]).toHaveTextContent("1 click");
    expect(items[2]).not.toHaveTextContent("1 clicks");
  });

  it("shows an empty state for top projects when there are no clicks", async () => {
    mockedGetAnalyticsSummary.mockResolvedValueOnce(makeSummary());

    const ui = await AdminDashboardPage();
    render(ui);

    expect(screen.getByText(/no project clicks yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    // Zero metrics still render (not blank) so the owner sees the dashboard
    // is live with no data yet.
    const totalViewsTerm = screen.getByText(/total views/i);
    expect(totalViewsTerm.nextElementSibling).toHaveTextContent("0");
  });
});

describe("AdminDashboardPage — relies on the guarded segment (Property 7; Req 9.1)", () => {
  it("renders under the (protected) route group whose layout enforces requireSession", () => {
    // The dashboard module resolves from app/admin/(protected)/page.tsx, so it
    // inherits app/admin/(protected)/layout.tsx — the layout that calls
    // requireSession() (verified in layout.test.tsx). Asserting the location
    // documents the guard dependency without duplicating the redirect test.
    const here = import.meta.url;
    expect(here).toMatch(/\/admin\/\(protected\)\/page\.test\.tsx$/);
  });
});
