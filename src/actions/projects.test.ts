import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the admin project-management Server Actions
 * (Requirement 10; Properties 1 & 7).
 *
 * Focus areas:
 *  - Property 7 / Req 9.5: every mutating action calls `requireSession` BEFORE
 *    any Prisma write, and an unauthenticated caller (requireSession redirects /
 *    throws) results in NO mutation.
 *  - Req 10.4: invalid input returns structured field errors and writes nothing.
 *  - Req 10.1/10.2/10.3: create/update/delete call the correct Prisma ops and
 *    revalidate the public + admin surfaces.
 *  - Property 1 / Req 10.5: `reorderFeatured` enforces the 3–6 featured bound and
 *    assigns a contiguous ascending `order` matching the chosen sequence.
 *
 * `@/lib/prisma`, `@/lib/auth`, and `next/cache` are mocked so the tests never
 * touch a real database, session, or the Next cache.
 */

// --- Mock the shared Prisma client. Factory must not reference outer scope. --
vi.mock("@/lib/prisma", () => {
  const client = {
    project: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { __esModule: true, default: client, prisma: client };
});

// --- Mock the auth guard so we can drive authed / unauthenticated branches. --
class RedirectError extends Error {
  constructor() {
    super("NEXT_REDIRECT");
    this.name = "RedirectError";
  }
}
vi.mock("@/lib/auth", () => ({
  __esModule: true,
  requireSession: vi.fn(),
}));

// --- Mock next/cache so revalidatePath is observable without a Next runtime. -
vi.mock("next/cache", () => ({
  __esModule: true,
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  createProject,
  deleteProject,
  reorderFeatured,
  updateProject,
} from "./projects";

const mockedPrisma = prisma as unknown as {
  project: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};
const mockedRequireSession = requireSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockedRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;

/** A valid create/update payload (mirrors projectSchema's required fields). */
function buildProjectInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Realtime Analytics Platform",
    slug: "realtime-analytics-platform",
    summary: "A streaming analytics dashboard.",
    problem: "Teams lacked live visibility.",
    solution: "Built a websocket pipeline.",
    impact: "Cut decision latency by 80%.",
    technologies: ["Next.js", "PostgreSQL"],
    thumbnailUrl: "https://example.com/thumb.png",
    githubUrl: "https://github.com/me/project",
    liveUrl: "https://project.example.com",
    featured: true,
    order: 0,
    ...overrides,
  };
}

/** Make `requireSession` behave like an unauthenticated guard (it redirects). */
function makeUnauthenticated() {
  mockedRequireSession.mockImplementationOnce(async () => {
    throw new RedirectError();
  });
}

/** Make `requireSession` behave like an authenticated owner. */
function makeAuthenticated() {
  mockedRequireSession.mockResolvedValue({
    sub: "owner@example.com",
    iat: 0,
    exp: 9_999_999_999,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  makeAuthenticated();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Auth guard everywhere — unauthenticated mutations are rejected (Property 7; Req 9.5)", () => {
  it("createProject rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(createProject(buildProjectInput())).rejects.toBeInstanceOf(
      RedirectError,
    );

    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("updateProject rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(
      updateProject("project_1", buildProjectInput()),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(mockedPrisma.project.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("deleteProject rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(deleteProject("project_1")).rejects.toBeInstanceOf(
      RedirectError,
    );

    expect(mockedPrisma.project.delete).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("reorderFeatured rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(reorderFeatured(["a", "b", "c"])).rejects.toBeInstanceOf(
      RedirectError,
    );

    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("checks the session BEFORE touching Prisma (guard ordering)", async () => {
    // requireSession throws synchronously-after-await; if any create ran before
    // the guard, the create mock would have been called. It must not be.
    makeUnauthenticated();
    await expect(createProject(buildProjectInput())).rejects.toBeInstanceOf(
      RedirectError,
    );
    expect(mockedRequireSession).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
  });
});

describe("createProject — validated persistence (Req 10.1, 10.4)", () => {
  it("creates the project, revalidates, and returns the new id for valid input", async () => {
    mockedPrisma.project.create.mockResolvedValueOnce({ id: "project_1" });

    const result = await createProject(buildProjectInput());

    expect(result).toEqual({ success: true, data: { id: "project_1" } });
    expect(mockedPrisma.project.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.project.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Realtime Analytics Platform",
        slug: "realtime-analytics-platform",
        featured: true,
        order: 0,
      }),
    });
    // Reflect on the public homepage + admin list (Req 10.1).
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/projects");
    expect(mockedRevalidate).toHaveBeenCalledWith("/projects/[slug]", "page");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/projects");
  });

  it("persists multiple project images in display order", async () => {
    mockedPrisma.project.create.mockResolvedValueOnce({ id: "project_1" });

    await createProject(
      buildProjectInput({
        imageUrls: [
          "https://example.com/cover.webp",
          "https://example.com/detail.webp",
        ],
      }),
    );

    expect(mockedPrisma.project.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        thumbnailUrl:
          'portfolio-gallery:["https://example.com/cover.webp","https://example.com/detail.webp"]',
      }),
    });
  });

  it("returns fieldErrors and does NOT persist for invalid input (Req 10.4)", async () => {
    const result = await createProject(
      buildProjectInput({ slug: "Not A Slug!", technologies: [] }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.slug).toBeDefined();
      expect(result.fieldErrors?.technologies).toBeDefined();
    }
    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("surfaces a slug conflict as an inline field error", async () => {
    const { Prisma } = await import("@prisma/client");
    mockedPrisma.project.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "6.x",
      }),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await createProject(buildProjectInput());

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.slug).toBeDefined();
    }
    expect(mockedRevalidate).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("updateProject — edits reflect on the public site (Req 10.2, 10.4)", () => {
  it("updates by id, revalidates, and returns the id for valid input", async () => {
    mockedPrisma.project.update.mockResolvedValueOnce({ id: "project_1" });

    const result = await updateProject("project_1", buildProjectInput());

    expect(result).toEqual({ success: true, data: { id: "project_1" } });
    expect(mockedPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: expect.objectContaining({ slug: "realtime-analytics-platform" }),
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/projects");
  });

  it("returns fieldErrors and does NOT persist for invalid input (Req 10.4)", async () => {
    const result = await updateProject(
      "project_1",
      buildProjectInput({ title: "   " }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.title).toBeDefined();
    }
    expect(mockedPrisma.project.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("rejects a missing id without persisting", async () => {
    const result = await updateProject("  ", buildProjectInput());
    expect(result.success).toBe(false);
    expect(mockedPrisma.project.update).not.toHaveBeenCalled();
  });
});

describe("deleteProject — removal reflects publicly (Req 10.1, 10.3)", () => {
  it("deletes by id and revalidates", async () => {
    mockedPrisma.project.delete.mockResolvedValueOnce({ id: "project_1" });

    const result = await deleteProject("project_1");

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.project.delete).toHaveBeenCalledWith({
      where: { id: "project_1" },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/projects");
  });

  it("rejects a missing id without persisting", async () => {
    const result = await deleteProject("");
    expect(result.success).toBe(false);
    expect(mockedPrisma.project.delete).not.toHaveBeenCalled();
  });
});

describe("reorderFeatured — featured bound and ordering (Property 1; Req 10.5)", () => {
  it("rejects fewer than the minimum (3) featured projects and writes nothing", async () => {
    const result = await reorderFeatured(["a", "b"]);

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.formError).toContain("between 3 and 6");
    }
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("rejects more than the maximum (6) featured projects and writes nothing", async () => {
    const result = await reorderFeatured(["a", "b", "c", "d", "e", "f", "g"]);

    expect(result.success).toBe(false);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("rejects a selection with duplicate ids", async () => {
    const result = await reorderFeatured(["a", "b", "a"]);

    expect(result.success).toBe(false);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("accepts the lower bound (3) and assigns contiguous ascending order", async () => {
    mockedPrisma.$transaction.mockResolvedValueOnce([]);
    mockedPrisma.project.update.mockImplementation((args) => args);
    mockedPrisma.project.updateMany.mockImplementation((args) => args);

    const result = await reorderFeatured(["p1", "p2", "p3"]);

    expect(result).toEqual({ success: true });

    // Unfeature everyone NOT selected.
    expect(mockedPrisma.project.updateMany).toHaveBeenCalledWith({
      where: { id: { notIn: ["p1", "p2", "p3"] } },
      data: { featured: false },
    });

    // Feature + order each selected project by its array index.
    expect(mockedPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { featured: true, order: 0 },
    });
    expect(mockedPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "p2" },
      data: { featured: true, order: 1 },
    });
    expect(mockedPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "p3" },
      data: { featured: true, order: 2 },
    });

    // The whole change happens in one transaction, then revalidates.
    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/projects");
  });

  it("accepts the upper bound (6) featured projects", async () => {
    mockedPrisma.$transaction.mockResolvedValueOnce([]);
    mockedPrisma.project.update.mockImplementation((args) => args);
    mockedPrisma.project.updateMany.mockImplementation((args) => args);

    const result = await reorderFeatured(["a", "b", "c", "d", "e", "f"]);

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.project.update).toHaveBeenCalledTimes(6);
  });

  it("rejects malformed (non-string / empty) ids without persisting", async () => {
    const result = await reorderFeatured(["a", "", "c"]);
    expect(result.success).toBe(false);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });
});
