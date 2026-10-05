import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostStatus } from "@prisma/client";

/**
 * Integration tests for the admin blog-management Server Actions
 * (Requirement 11; Properties 3 & 7).
 *
 * Focus areas:
 *  - Property 7 / Req 9.5: every mutating action calls `requireSession` BEFORE
 *    any Prisma write, and an unauthenticated caller (requireSession redirects /
 *    throws) results in NO mutation.
 *  - Req 11.1: `createPost` ALWAYS persists a new post as DRAFT (with no
 *    publishedAt), so it is never publicly visible until explicitly published.
 *  - Req 11.4 / Property 3: `setPostStatus(PUBLISHED)` flips status to PUBLISHED
 *    and stamps `publishedAt`, making the post public.
 *  - Req 11.5 / Property 3: `setPostStatus(DRAFT)` flips status to DRAFT and
 *    clears `publishedAt`, hiding the post from public views.
 *  - Req 11.2/11.3: update/delete call the correct Prisma ops and revalidate the
 *    public + admin surfaces; update never changes publish state.
 *  - Validation: invalid input returns structured field errors and writes
 *    nothing.
 *
 * `@/lib/prisma`, `@/lib/auth`, and `next/cache` are mocked so the tests never
 * touch a real database, session, or the Next cache.
 */

// --- Mock the shared Prisma client. Factory must not reference outer scope. --
vi.mock("@/lib/prisma", () => {
  const client = {
    post: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
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
  createPost,
  deletePost,
  setPostStatus,
  updatePost,
} from "./posts";

const mockedPrisma = prisma as unknown as {
  post: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};
const mockedRequireSession = requireSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockedRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;

/** A valid create/update payload (mirrors postSchema's required fields). */
function buildPostInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Shipping fast with Server Actions",
    slug: "shipping-fast-with-server-actions",
    excerpt: "How we cut our API surface in half.",
    content: "The full article body goes here.",
    coverUrl: "https://example.com/cover.png",
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
  it("createPost rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(createPost(buildPostInput())).rejects.toBeInstanceOf(
      RedirectError,
    );

    expect(mockedPrisma.post.create).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("updatePost rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(
      updatePost("post_1", buildPostInput()),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("deletePost rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(deletePost("post_1")).rejects.toBeInstanceOf(RedirectError);

    expect(mockedPrisma.post.delete).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("setPostStatus rejects and performs NO write when unauthenticated", async () => {
    makeUnauthenticated();

    await expect(
      setPostStatus("post_1", PostStatus.PUBLISHED),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("checks the session BEFORE touching Prisma (guard ordering)", async () => {
    makeUnauthenticated();
    await expect(createPost(buildPostInput())).rejects.toBeInstanceOf(
      RedirectError,
    );
    expect(mockedRequireSession).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.post.create).not.toHaveBeenCalled();
  });
});

describe("createPost — defaults to DRAFT (Req 11.1; Property 3)", () => {
  it("persists a new post as DRAFT with no publishedAt, revalidates, returns id", async () => {
    mockedPrisma.post.create.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    const result = await createPost(buildPostInput());

    expect(result).toEqual({ success: true, data: { id: "post_1" } });
    expect(mockedPrisma.post.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Shipping fast with Server Actions",
        slug: "shipping-fast-with-server-actions",
        status: PostStatus.DRAFT,
        publishedAt: null,
      }),
    });
    // Reflect on the public homepage, blog listing, article, + admin list.
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/blog");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/blog");
  });

  it("forces DRAFT even when the input asks for PUBLISHED (Req 11.1)", async () => {
    mockedPrisma.post.create.mockResolvedValueOnce({
      id: "post_2",
      slug: "shipping-fast-with-server-actions",
    });

    await createPost(
      buildPostInput({
        status: PostStatus.PUBLISHED,
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      }),
    );

    const createArg = mockedPrisma.post.create.mock.calls[0]?.[0];
    expect(createArg.data.status).toBe(PostStatus.DRAFT);
    expect(createArg.data.publishedAt).toBeNull();
  });

  it("returns fieldErrors and does NOT persist for invalid input", async () => {
    const result = await createPost(
      buildPostInput({ slug: "Not A Slug!", content: "   " }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.slug).toBeDefined();
      expect(result.fieldErrors?.content).toBeDefined();
    }
    expect(mockedPrisma.post.create).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("surfaces a slug conflict as an inline field error", async () => {
    const { Prisma } = await import("@prisma/client");
    mockedPrisma.post.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "6.x",
      }),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createPost(buildPostInput());

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.slug).toBeDefined();
    }
    expect(mockedRevalidate).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("setPostStatus — publish makes public / draft hides (Req 11.4, 11.5; Property 3)", () => {
  it("PUBLISHED sets status PUBLISHED and stamps publishedAt", async () => {
    mockedPrisma.post.update.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    const result = await setPostStatus("post_1", PostStatus.PUBLISHED);

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.post.update).toHaveBeenCalledTimes(1);

    const updateArg = mockedPrisma.post.update.mock.calls[0]?.[0];
    expect(updateArg.where).toEqual({ id: "post_1" });
    expect(updateArg.data.status).toBe(PostStatus.PUBLISHED);
    expect(updateArg.data.publishedAt).toBeInstanceOf(Date);

    // Public surfaces revalidated so the now-published post appears (Req 11.4).
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/blog");
    expect(mockedRevalidate).toHaveBeenCalledWith(
      "/blog/shipping-fast-with-server-actions",
    );
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/blog");
  });

  it("DRAFT sets status DRAFT and clears publishedAt (hides from public)", async () => {
    mockedPrisma.post.update.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    const result = await setPostStatus("post_1", PostStatus.DRAFT);

    expect(result).toEqual({ success: true });

    const updateArg = mockedPrisma.post.update.mock.calls[0]?.[0];
    expect(updateArg.data.status).toBe(PostStatus.DRAFT);
    expect(updateArg.data.publishedAt).toBeNull();

    // Public surfaces revalidated so the now-hidden post disappears (Req 11.5).
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/blog");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/blog");
  });

  it("rejects an invalid status value without persisting", async () => {
    const result = await setPostStatus(
      "post_1",
      "ARCHIVED" as unknown as PostStatus,
    );

    expect(result.success).toBe(false);
    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("rejects a missing id without persisting", async () => {
    const result = await setPostStatus("  ", PostStatus.PUBLISHED);
    expect(result.success).toBe(false);
    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
  });
});

describe("updatePost — edits content, never the publish state (Req 11.2)", () => {
  it("updates by id, revalidates, and returns the id for valid input", async () => {
    mockedPrisma.post.update.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    const result = await updatePost("post_1", buildPostInput());

    expect(result).toEqual({ success: true, data: { id: "post_1" } });
    expect(mockedPrisma.post.update).toHaveBeenCalledWith({
      where: { id: "post_1" },
      data: expect.objectContaining({
        slug: "shipping-fast-with-server-actions",
      }),
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/blog");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/blog");
  });

  it("never includes status/publishedAt in the update payload", async () => {
    mockedPrisma.post.update.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    await updatePost(
      "post_1",
      buildPostInput({
        status: PostStatus.PUBLISHED,
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      }),
    );

    const updateArg = mockedPrisma.post.update.mock.calls[0]?.[0];
    expect(updateArg.data).not.toHaveProperty("status");
    expect(updateArg.data).not.toHaveProperty("publishedAt");
  });

  it("returns fieldErrors and does NOT persist for invalid input", async () => {
    const result = await updatePost(
      "post_1",
      buildPostInput({ title: "   " }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.title).toBeDefined();
    }
    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("rejects a missing id without persisting", async () => {
    const result = await updatePost("  ", buildPostInput());
    expect(result.success).toBe(false);
    expect(mockedPrisma.post.update).not.toHaveBeenCalled();
  });
});

describe("deletePost — removal reflects publicly (Req 11.3)", () => {
  it("deletes by id and revalidates", async () => {
    mockedPrisma.post.delete.mockResolvedValueOnce({
      id: "post_1",
      slug: "shipping-fast-with-server-actions",
    });

    const result = await deletePost("post_1");

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.post.delete).toHaveBeenCalledWith({
      where: { id: "post_1" },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/");
    expect(mockedRevalidate).toHaveBeenCalledWith("/blog");
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/blog");
  });

  it("rejects a missing id without persisting", async () => {
    const result = await deletePost("");
    expect(result.success).toBe(false);
    expect(mockedPrisma.post.delete).not.toHaveBeenCalled();
  });
});
