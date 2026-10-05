import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// --- Mock next/navigation notFound -----------------------------------------
// notFound() throws a NEXT_NOT_FOUND control-flow error in Next; emulate that
// so the page stops executing on the missing/unpublished path, just like the
// real runtime (mirrors how auth tests emulate redirect()).
class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
    this.name = "NotFoundError";
  }
}
const notFoundMock = vi.fn(() => {
  throw new NotFoundError();
});
vi.mock("next/navigation", () => ({
  __esModule: true,
  notFound: () => notFoundMock(),
}));

// --- Mock the centralized published-only data helper ------------------------
// The published-only filtering itself is covered by data.test.ts; here we drive
// the page's not-found vs. render branches by controlling its return value.
vi.mock("@/features/blog/data", () => ({
  __esModule: true,
  getPublishedPostBySlug: vi.fn(),
}));

import { getPublishedPostBySlug } from "@/features/blog/data";
import BlogArticlePage, { generateMetadata } from "./page";

const mockedGetPost = getPublishedPostBySlug as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const publishedPost = {
  id: "post-live",
  title: "A Published Article",
  slug: "a-published-article",
  excerpt: "An excerpt.",
  content: "The full body of the article.",
  coverUrl: undefined,
  publishedAt: "2024-09-12T00:00:00.000Z",
};

describe("BlogArticlePage — draft/missing slug yields not-found (Property 3; Req 7.3, 7.4)", () => {
  it("calls notFound() when the slug resolves to no published post (draft or missing)", async () => {
    // A DRAFT (or non-existent) slug returns null from the published-only helper.
    mockedGetPost.mockResolvedValueOnce(null);

    await expect(
      BlogArticlePage({ params: Promise.resolve({ slug: "edge-rendering-playbook" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(mockedGetPost).toHaveBeenCalledWith("edge-rendering-playbook");
  });

  it("renders the article when the slug resolves to a published post", async () => {
    mockedGetPost.mockResolvedValueOnce(publishedPost);

    const ui = await BlogArticlePage({
      params: Promise.resolve({ slug: publishedPost.slug }),
    });
    render(ui);

    expect(
      screen.getByRole("heading", { level: 1, name: /a published article/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The full body of the article."),
    ).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});

describe("BlogArticlePage — generateMetadata", () => {
  it("derives title/description from a published post", async () => {
    mockedGetPost.mockResolvedValueOnce(publishedPost);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: publishedPost.slug }),
    });

    expect(meta.title).toBe("A Published Article");
    expect(meta.description).toBe("An excerpt.");
  });

  it("returns empty metadata for a missing/unpublished slug", async () => {
    mockedGetPost.mockResolvedValueOnce(null);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(meta).toEqual({});
  });
});
