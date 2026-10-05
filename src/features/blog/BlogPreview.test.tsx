import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PostView } from "@/types";
import { BLOG_PREVIEW_LIMIT } from "./config";
import { BlogPreview } from "./BlogPreview";

/** Build a published PostView with overridable fields. */
function makePost(
  slug: string,
  publishedAt: string | null,
  overrides: Partial<PostView> = {},
): PostView {
  return {
    id: `post-${slug}`,
    title: `Title ${slug}`,
    slug,
    excerpt: `Excerpt ${slug}`,
    content: `Content ${slug}`,
    coverUrl: undefined,
    publishedAt,
    ...overrides,
  };
}

/**
 * `BlogPreview` is an async Server Component. Awaiting it yields a plain React
 * element we can render with Testing Library.
 */
async function renderPreview(
  posts: readonly PostView[],
  props: { limit?: number } = {},
) {
  const ui = await BlogPreview({ posts, ...props });
  return render(ui);
}

describe("BlogPreview — recency ordering & latest-N (Property 10; Req 7.1)", () => {
  it("renders posts most-recent-first by publishedAt", async () => {
    await renderPreview([
      makePost("oldest", "2024-01-01T00:00:00.000Z"),
      makePost("newest", "2025-06-01T00:00:00.000Z"),
      makePost("middle", "2024-09-12T00:00:00.000Z"),
    ]);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual(["Title newest", "Title middle", "Title oldest"]);
  });

  it("renders at most the preview limit even when more posts exist", async () => {
    const posts = Array.from({ length: BLOG_PREVIEW_LIMIT + 3 }, (_, i) =>
      makePost(`p${i}`, `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`),
    );
    await renderPreview(posts);

    expect(screen.getAllByRole("article")).toHaveLength(BLOG_PREVIEW_LIMIT);
  });

  it("links each card to its full article (Req 7.3)", async () => {
    await renderPreview([makePost("hello-world", "2024-09-12T00:00:00.000Z")]);

    const link = screen.getByRole("link", { name: /title hello-world/i });
    expect(link).toHaveAttribute("href", "/blog/hello-world");
  });

  it("renders a 'view all' link to the listing page", async () => {
    await renderPreview([makePost("a", "2024-09-12T00:00:00.000Z")]);
    expect(
      screen.getByRole("link", { name: /view all articles/i }),
    ).toHaveAttribute("href", "/blog");
  });
});

describe("BlogPreview — empty state (Req 7.2)", () => {
  it("renders an empty state and no article cards when there are no posts", async () => {
    await renderPreview([]);

    expect(screen.getByText(/articles coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /view all articles/i }),
    ).not.toBeInTheDocument();
  });
});

describe("BlogPreview — accessible landmark", () => {
  it("exposes a blog section labelled by its heading", async () => {
    await renderPreview([makePost("a", "2024-09-12T00:00:00.000Z")]);
    expect(
      screen.getByRole("region", { name: /latest articles/i }),
    ).toBeInTheDocument();
  });
});
