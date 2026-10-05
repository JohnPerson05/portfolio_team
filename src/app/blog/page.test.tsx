import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the centralized published-only data helper. The published-only filtering
// itself is covered by data.test.ts; here we drive the page's list vs.
// empty-state branches by controlling its return value.
vi.mock("@/features/blog/data", () => ({
  __esModule: true,
  getPublishedPosts: vi.fn(),
}));

import { getPublishedPosts } from "@/features/blog/data";
import BlogListingPage from "./page";

const mockedGetPosts = getPublishedPosts as unknown as ReturnType<typeof vi.fn>;

function makePost(slug: string, publishedAt: string) {
  return {
    id: `post-${slug}`,
    title: `Title ${slug}`,
    slug,
    excerpt: `Excerpt ${slug}`,
    content: `Content ${slug}`,
    coverUrl: undefined,
    publishedAt,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BlogListingPage — published posts reachable, ordered (Properties 3 & 10; Req 7.1, 7.4)", () => {
  it("renders a linked card per published post in the order returned", async () => {
    mockedGetPosts.mockResolvedValueOnce([
      makePost("newest", "2025-06-01T00:00:00.000Z"),
      makePost("older", "2024-09-12T00:00:00.000Z"),
    ]);

    const ui = await BlogListingPage();
    render(ui);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual(["Title newest", "Title older"]);

    expect(
      screen.getByRole("link", { name: /title newest/i }),
    ).toHaveAttribute("href", "/blog/newest");
  });
});

describe("BlogListingPage — empty state (Req 7.2)", () => {
  it("renders an empty state and no cards when there are no published posts", async () => {
    mockedGetPosts.mockResolvedValueOnce([]);

    const ui = await BlogListingPage();
    render(ui);

    expect(screen.getByText(/articles coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
