import type { Post, PostStatus } from "@prisma/client";

import prisma from "@/lib/prisma";

/**
 * Admin blog reads (Task 23). Unlike the public blog data layer
 * (`@/features/blog/data`, which returns ONLY `status = PUBLISHED` posts —
 * Property 3), the admin CMS needs the FULL set including drafts so the owner
 * can write, edit, delete, and publish/unpublish.
 *
 * The public {@link import("@/types").PostView} DTO intentionally omits
 * `status` (it is the published-only projection), so the admin list needs the
 * status to render the draft/published badge and drive the toggle. This module
 * therefore exposes its own {@link AdminPostView} DTO that adds `status` (and
 * `createdAt`/`updatedAt` ISO strings) while still keeping the admin Server
 * Components free of raw `Date`/nullable Prisma types (Requirement 17.2).
 */

/** A post as rendered in the admin list/form, including its draft/published status. */
export interface AdminPostView {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  status: PostStatus;
  /** ISO-8601 string; null when not yet published. */
  publishedAt: string | null;
  /** ISO-8601 string for when the post was created. */
  createdAt: string;
  /** ISO-8601 string for when the post was last updated. */
  updatedAt: string;
}

/** Map a Prisma `Post` row to the admin view DTO. */
function toAdminPostView(post: Post): AdminPostView {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverUrl: post.coverUrl ?? undefined,
    status: post.status,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

/**
 * Fetch every post for the admin list (drafts AND published). Ordered most
 * recently updated first so work-in-progress surfaces at the top.
 */
export async function getAllPosts(): Promise<AdminPostView[]> {
  const rows = await prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toAdminPostView);
}

/**
 * Fetch a single post for the edit page, or `null` when it does not exist (so
 * the route can render a not-found state).
 */
export async function getPostById(id: string): Promise<AdminPostView | null> {
  const row = await prisma.post.findUnique({ where: { id } });
  return row ? toAdminPostView(row) : null;
}
