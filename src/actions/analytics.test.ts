import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventType } from "@prisma/client";

// Mock the shared Prisma client so these tests never touch a real database.
// The factory must not reference outer-scope variables (vi.mock is hoisted), so
// the mock functions are created inline and retrieved via the imported module.
vi.mock("@/lib/prisma", () => {
  const client = {
    analyticsEvent: {
      create: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

import prisma from "@/lib/prisma";
import { getAnalyticsSummary, recordEvent } from "./analytics";

// Typed handles to the mocked Prisma methods.
const mockedPrisma = prisma as unknown as {
  analyticsEvent: {
    create: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  project: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("recordEvent — event completeness (Property 5; Requirements 13.1–13.5)", () => {
  // Every tracked interaction must persist exactly one event of the right type.
  const eventTypes: EventType[] = [
    EventType.PORTFOLIO_VIEW,
    EventType.PROJECT_CLICK,
    EventType.RESUME_DOWNLOAD,
    EventType.CONTACT_SUBMISSION,
  ];

  it.each(eventTypes)(
    "persists exactly one AnalyticsEvent of type %s",
    async (type) => {
      mockedPrisma.analyticsEvent.create.mockResolvedValueOnce({ id: "evt_1" });

      await recordEvent({ type });

      expect(mockedPrisma.analyticsEvent.create).toHaveBeenCalledTimes(1);
      expect(mockedPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: { type, projectId: undefined, path: undefined },
      });
    },
  );

  it("passes through projectId and path for a project click", async () => {
    mockedPrisma.analyticsEvent.create.mockResolvedValueOnce({ id: "evt_2" });

    await recordEvent({
      type: EventType.PROJECT_CLICK,
      projectId: "proj_123",
      path: "/#projects",
    });

    expect(mockedPrisma.analyticsEvent.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.analyticsEvent.create).toHaveBeenCalledWith({
      data: {
        type: EventType.PROJECT_CLICK,
        projectId: "proj_123",
        path: "/#projects",
      },
    });
  });
});

describe("recordEvent — non-blocking analytics (Property 6; Requirement 13.7)", () => {
  it("does not throw when the database write rejects, and logs the error", async () => {
    const dbError = new Error("connection refused");
    mockedPrisma.analyticsEvent.create.mockRejectedValueOnce(dbError);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Must resolve (not reject) — the visitor experience is never disrupted.
    await expect(
      recordEvent({ type: EventType.PORTFOLIO_VIEW }),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to record analytics event",
      dbError,
    );
  });
});

describe("getAnalyticsSummary — aggregation (Requirement 13.6)", () => {
  it("maps per-type counts, ranks top projects, and maps recent activity", async () => {
    // groupBy("type") rows — note RESUME_DOWNLOAD intentionally absent to
    // verify it defaults to 0.
    mockedPrisma.analyticsEvent.groupBy
      .mockResolvedValueOnce([
        { type: EventType.PORTFOLIO_VIEW, _count: { _all: 42 } },
        { type: EventType.PROJECT_CLICK, _count: { _all: 9 } },
        { type: EventType.CONTACT_SUBMISSION, _count: { _all: 3 } },
      ])
      // groupBy("projectId") rows — already ordered by clicks desc.
      .mockResolvedValueOnce([
        { projectId: "proj_a", _count: { _all: 6 } },
        { projectId: "proj_b", _count: { _all: 3 } },
      ]);

    mockedPrisma.project.findMany.mockResolvedValueOnce([
      // Returned out of rank order to prove ranking order is preserved.
      { id: "proj_b", title: "Project B" },
      { id: "proj_a", title: "Project A" },
    ]);

    const recentDate = new Date("2024-01-02T03:04:05.000Z");
    mockedPrisma.analyticsEvent.findMany.mockResolvedValueOnce([
      {
        id: "evt_recent",
        type: EventType.PROJECT_CLICK,
        path: "/#projects",
        projectId: "proj_a",
        createdAt: recentDate,
      },
    ]);

    const summary = await getAnalyticsSummary();

    expect(summary.totalViews).toBe(42);
    expect(summary.projectClicks).toBe(9);
    expect(summary.resumeDownloads).toBe(0);
    expect(summary.contactSubmissions).toBe(3);

    // Ranking order preserved (clicks descending), titles joined correctly.
    expect(summary.topProjects).toEqual([
      { projectId: "proj_a", title: "Project A", clicks: 6 },
      { projectId: "proj_b", title: "Project B", clicks: 3 },
    ]);

    expect(summary.recent).toEqual([
      {
        id: "evt_recent",
        type: EventType.PROJECT_CLICK,
        path: "/#projects",
        projectId: "proj_a",
        createdAt: recentDate,
      },
    ]);
  });

  it("returns zeros and empty collections when there is no data", async () => {
    mockedPrisma.analyticsEvent.groupBy
      .mockResolvedValueOnce([]) // counts by type
      .mockResolvedValueOnce([]); // top projects grouping
    mockedPrisma.analyticsEvent.findMany.mockResolvedValueOnce([]);

    const summary = await getAnalyticsSummary();

    expect(summary).toEqual({
      totalViews: 0,
      projectClicks: 0,
      resumeDownloads: 0,
      contactSubmissions: 0,
      topProjects: [],
      recent: [],
    });
    // No projects to resolve, so the title lookup is skipped entirely.
    expect(mockedPrisma.project.findMany).not.toHaveBeenCalled();
  });

  it("labels a clicked-but-deleted project gracefully", async () => {
    mockedPrisma.analyticsEvent.groupBy
      .mockResolvedValueOnce([
        { type: EventType.PROJECT_CLICK, _count: { _all: 4 } },
      ])
      .mockResolvedValueOnce([{ projectId: "proj_gone", _count: { _all: 4 } }]);
    // Project row no longer exists.
    mockedPrisma.project.findMany.mockResolvedValueOnce([]);
    mockedPrisma.analyticsEvent.findMany.mockResolvedValueOnce([]);

    const summary = await getAnalyticsSummary();

    expect(summary.topProjects).toEqual([
      { projectId: "proj_gone", title: "(deleted project)", clicks: 4 },
    ]);
  });
});
