import { describe, expect, it } from "vitest";
import type { PostView } from "@/types";
import {
  BLOG_PREVIEW_LIMIT,
  formatPublishedDate,
  selectLatest,
  sortByRecency,
} from "./config";

/** Build a minimal published PostView with a given slug and publishedAt. */
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

describe("sortByRecency — recency ordering (Property 10; Req 7.1)", () => {
  it("orders posts most-recent-first by publishedAt regardless of input order", () => {
    const result = sortByRecency([
      makePost("oldest", "2024-01-01T00:00:00.000Z"),
      makePost("newest", "2025-06-01T00:00:00.000Z"),
      makePost("middle", "2024-09-12T00:00:00.000Z"),
    ]);
    expect(result.map((p) => p.slug)).toEqual(["newest", "middle", "oldest"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      makePost("a", "2024-01-01T00:00:00.000Z"),
      makePost("b", "2025-01-01T00:00:00.000Z"),
    ];
    const snapshot = input.map((p) => p.slug);
    sortByRecency(input);
    expect(input.map((p) => p.slug)).toEqual(snapshot);
  });

  it("sorts a null publishedAt last so it never displaces a dated post", () => {
    const result = sortByRecency([
      makePost("no-date", null),
      makePost("dated", "2024-01-01T00:00:00.000Z"),
    ]);
    expect(result.map((p) => p.slug)).toEqual(["dated", "no-date"]);
  });
});

describe("selectLatest — latest-N preview (Property 10; Req 7.1)", () => {
  it("returns at most the limit, most-recent-first", () => {
    const posts = Array.from({ length: 6 }, (_, i) =>
      // i = 0 is oldest (Jan), i = 5 is newest (Jun).
      makePost(`p${i}`, `2024-0${i + 1}-01T00:00:00.000Z`),
    );
    const result = selectLatest(posts, 3);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.slug)).toEqual(["p5", "p4", "p3"]);
  });

  it("defaults to BLOG_PREVIEW_LIMIT entries", () => {
    const posts = Array.from({ length: BLOG_PREVIEW_LIMIT + 4 }, (_, i) =>
      makePost(`p${i}`, `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`),
    );
    expect(selectLatest(posts)).toHaveLength(BLOG_PREVIEW_LIMIT);
  });

  it("returns every post when fewer than the limit exist", () => {
    const result = selectLatest(
      [
        makePost("a", "2024-01-01T00:00:00.000Z"),
        makePost("b", "2024-02-01T00:00:00.000Z"),
      ],
      3,
    );
    expect(result.map((p) => p.slug)).toEqual(["b", "a"]);
  });

  it("returns an empty array for no posts", () => {
    expect(selectLatest([])).toEqual([]);
  });
});

describe("formatPublishedDate", () => {
  it("formats an ISO timestamp as a long UTC date", () => {
    expect(formatPublishedDate("2024-09-12T00:00:00.000Z")).toBe(
      "September 12, 2024",
    );
  });

  it("returns an empty string for an unparseable value", () => {
    expect(formatPublishedDate("not-a-date")).toBe("");
  });
});
