import { PostStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { toPostView, type PostView } from "@/types";
import { BLOG_PREVIEW_LIMIT } from "./config";

/**
 * Centralized published-only data access for the public blog
 * (Correctness Property 3 / Requirements 7.4, 11.5).
 *
 * Every public blog surface — homepage preview, listing page, and article page
 * — reads through these helpers, and every query here filters
 * `status = PostStatus.PUBLISHED`. Concentrating the invariant in one module
 * (rather than re-deriving it at each call site) means a `DRAFT` post can never
 * leak into a public view, and the guarantee is testable in isolation.
 *
 * Rows are mapped to the serializable {@link PostView} DTO so Server Components
 * (and any client islands) stay free of `Date`/nullable Prisma types
 * (Requirement 17.2).
 */

/**
 * Fetch the latest published posts for the homepage preview
 * (Requirements 7.1, 7.4; Correctness Properties 3 & 10).
 *
 * Returns only `PUBLISHED` posts ordered most-recent-first by `publishedAt`,
 * capped at `limit` (default {@link BLOG_PREVIEW_LIMIT}) at the database layer.
 */
export async function getLatestPublishedPosts(
  limit: number = BLOG_PREVIEW_LIMIT,
): Promise<PostView[]> {
  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return rows.map(toPostView);
}

/**
 * Fetch all published posts for the full listing page
 * (Requirements 7.1, 7.4; Correctness Properties 3 & 10).
 *
 * Returns only `PUBLISHED` posts ordered most-recent-first by `publishedAt`.
 */
export async function getPublishedPosts(): Promise<PostView[]> {
  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
  });

  return rows.map(toPostView);
}

/**
 * Fetch a single published post by slug for the article page
 * (Requirements 7.3, 7.4; Correctness Property 3).
 *
 * Resolves to the {@link PostView} only when a post with the given slug exists
 * AND is `PUBLISHED`. A missing slug or a `DRAFT` post both resolve to `null`,
 * so the article page can render a 404 — a draft is never reachable publicly.
 */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PostView | null> {
  const post = await prisma.post.findFirst({
    where: { slug, status: PostStatus.PUBLISHED },
  });

  return post ? toPostView(post) : null;
}
