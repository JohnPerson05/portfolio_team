import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostStatus } from "@prisma/client";

// Mock the shared Prisma client so these tests never touch a real database.
// The factory must not reference outer-scope variables (vi.mock is hoisted), so
// the mock functions are created inline and retrieved via the imported module.
vi.mock("@/lib/prisma", () => {
  const client = {
    post: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

import prisma from "@/lib/prisma";
import {
  getLatestPublishedPosts,
  getPublishedPostBySlug,
  getPublishedPosts,
} from "./data";

// Typed handles to the mocked Prisma methods.
const mockedPrisma = prisma as unknown as {
  post: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
  };
};

/** Build a Prisma-shaped Post row (with Date/nullable fields). */
function makeRow(
  slug: string,
  status: PostStatus,
  publishedAt: Date | null,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `post-${slug}`,
    title: `Title ${slug}`,
    slug,
    excerpt: `Excerpt ${slug}`,
    content: `Content ${slug}`,
    coverUrl: null,
    status,
    publishedAt,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getPublishedPosts — published-only exposure (Property 3; Req 7.4)", () => {
  it("queries with a status = PUBLISHED filter, ordered most-recent-first", async () => {
    mockedPrisma.post.findMany.mockResolvedValueOnce([]);

    await getPublishedPosts();

    expect(mockedPrisma.post.findMany).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.post.findMany).toHaveBeenCalledWith({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
    });
  });

  it("maps rows to serializable PostView DTOs (ISO date strings)", async () => {
    mockedPrisma.post.findMany.mockResolvedValueOnce([
      makeRow("newest", PostStatus.PUBLISHED, new Date("2025-01-20T00:00:00.000Z")),
      makeRow("older", PostStatus.PUBLISHED, new Date("2024-09-12T00:00:00.000Z")),
    ]);

    const posts = await getPublishedPosts();

    expect(posts.map((p) => p.slug)).toEqual(["newest", "older"]);
    const [first] = posts;
    expect(first?.publishedAt).toBe("2025-01-20T00:00:00.000Z");
    // The DTO must not carry the Prisma-only `status`/Date fields.
    expect(first).not.toHaveProperty("status");
    expect(first).not.toHaveProperty("createdAt");
  });
});

describe("getLatestPublishedPosts — preview query (Properties 3 & 10; Req 7.1, 7.4)", () => {
  it("filters PUBLISHED, orders by publishedAt desc, and applies the limit", async () => {
    mockedPrisma.post.findMany.mockResolvedValueOnce([]);

    await getLatestPublishedPosts(3);

    expect(mockedPrisma.post.findMany).toHaveBeenCalledWith({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  });

  it("defaults the limit to the preview cap", async () => {
    mockedPrisma.post.findMany.mockResolvedValueOnce([]);

    await getLatestPublishedPosts();

    const call = mockedPrisma.post.findMany.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call.where).toEqual({ status: PostStatus.PUBLISHED });
    expect(typeof call.take).toBe("number");
    expect(call.take).toBeGreaterThan(0);
  });
});

describe("getPublishedPostBySlug — draft never reachable (Property 3; Req 7.3, 7.4)", () => {
  it("scopes the lookup to slug AND status = PUBLISHED", async () => {
    mockedPrisma.post.findFirst.mockResolvedValueOnce(
      makeRow("live", PostStatus.PUBLISHED, new Date("2024-09-12T00:00:00.000Z")),
    );

    const post = await getPublishedPostBySlug("live");

    expect(mockedPrisma.post.findFirst).toHaveBeenCalledWith({
      where: { slug: "live", status: PostStatus.PUBLISHED },
    });
    expect(post?.slug).toBe("live");
  });

  it("returns null when no published post matches the slug (draft or missing)", async () => {
    // A DRAFT post (or a non-existent slug) does not satisfy the PUBLISHED
    // filter, so Prisma resolves null and the helper returns null.
    mockedPrisma.post.findFirst.mockResolvedValueOnce(null);

    const post = await getPublishedPostBySlug("edge-rendering-playbook");

    expect(post).toBeNull();
  });
});
