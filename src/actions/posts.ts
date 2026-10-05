"use server";

import { revalidatePath } from "next/cache";
import { Prisma, PostStatus } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { postSchema } from "@/lib/validation";
import type { ActionResult } from "@/types";

/**
 * Admin blog-management Server Actions (Requirement 11; Properties 3 & 7).
 *
 * Every mutating action here follows the "Admin mutation (guarded)" sequence
 * from design.md:
 *   1. {@link requireSession} re-check FIRST (defense-in-depth, Property 7 /
 *      Req 9.5). Middleware already guards `/admin` routes at the edge, but each
 *      action independently verifies the session so an unauthenticated caller
 *      can never reach a mutation. `requireSession` redirects (throws
 *      `NEXT_REDIRECT`) when no session is present, so the function does not
 *      return — and crucially, NO Prisma write runs.
 *   2. Zod validation via {@link postSchema} (Req 11.x). On failure the action
 *      returns structured `fieldErrors` and writes nothing.
 *   3. Prisma mutation.
 *   4. {@link revalidatePath} for the public homepage (`/`), the blog listing
 *      (`/blog`), the affected article route (`/blog/[slug]`), and the admin
 *      blog routes so changes reflect publicly without a redeploy (Req 11.4 /
 *      11.5).
 *
 * Status workflow (Property 3 / Req 11.1, 11.4, 11.5):
 *   - {@link createPost} always persists a new post as `DRAFT` with no
 *     `publishedAt` (Req 11.1). A new post is therefore never publicly visible
 *     until it is explicitly published.
 *   - {@link setPostStatus} is the single gate for visibility: publishing sets
 *     `status = PUBLISHED` and stamps `publishedAt` (Req 11.4); reverting to
 *     `DRAFT` clears `publishedAt` and hides the post from every public view
 *     (Req 11.5 / Property 3 — the public data layer filters on
 *     `status = PUBLISHED`).
 *   - {@link updatePost} edits content only and never changes the publish state,
 *     so editing a live article does not accidentally unpublish it.
 */

/** Public homepage path to revalidate after a post mutation (Req 11.4/11.5). */
const PUBLIC_HOME_PATH = "/";
/** Public blog listing path to revalidate after a post mutation. */
const PUBLIC_BLOG_PATH = "/blog";
/** Admin blog list path to revalidate after a mutation. */
const ADMIN_BLOG_PATH = "/admin/blog";

/**
 * Raw create/update input as held by the admin form (the Zod *input* type, so
 * fields with schema defaults — `status` — are optional here).
 */
export type PostMutationInput = z.input<typeof postSchema>;

/** Generic failure message for unexpected persistence errors. */
const GENERIC_SAVE_ERROR =
  "Something went wrong saving the article. Please try again.";

/** Validate a raw status value against the Prisma `PostStatus` enum. */
const postStatusSchema = z.nativeEnum(PostStatus);

/**
 * Revalidate every surface a post can appear on: the public homepage preview,
 * the blog listing, the affected article route (when a slug is known), and the
 * admin blog list.
 */
function revalidatePostSurfaces(slug?: string): void {
  revalidatePath(PUBLIC_HOME_PATH);
  revalidatePath(PUBLIC_BLOG_PATH);
  if (slug) {
    revalidatePath(`${PUBLIC_BLOG_PATH}/${slug}`);
  }
  revalidatePath(ADMIN_BLOG_PATH);
}

/**
 * Translate a Prisma unique-constraint violation on `slug` into an inline field
 * error, so the owner sees "slug already exists" rather than a generic failure.
 * Returns `null` for any other error so the caller can fall back to a generic
 * form error.
 */
function slugConflictResult(error: unknown): ActionResult | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      success: false,
      fieldErrors: { slug: ["A post with this slug already exists"] },
    };
  }
  return null;
}

/**
 * Create a blog post (Requirement 11.1). Guarded by {@link requireSession}
 * (Property 7) and validated by {@link postSchema} before any write.
 *
 * A new post is ALWAYS created as `DRAFT` with no `publishedAt`, regardless of
 * any `status` in the input (Req 11.1) — visibility is granted exclusively via
 * {@link setPostStatus}. So a freshly created post is never reachable on the
 * public site until explicitly published (Property 3).
 */
export async function createPost(
  input: PostMutationInput,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth re-check FIRST — redirects (throws) when unauthenticated; no write.
  await requireSession();

  // 2. Validate. On failure return field errors; persist nothing.
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Force the initial draft state — ignore any status/publishedAt in the input.
  const { status: _status, publishedAt: _publishedAt, ...content } =
    parsed.data;

  // 3. Persist as a draft (Req 11.1).
  try {
    const created = await prisma.post.create({
      data: { ...content, status: PostStatus.DRAFT, publishedAt: null },
    });
    // 4. Reflect on the public surfaces + admin list.
    revalidatePostSurfaces(created.slug);
    return { success: true, data: { id: created.id } };
  } catch (error) {
    const conflict = slugConflictResult(error);
    if (conflict) return conflict;
    console.error("Failed to create post", error);
    return { success: false, formError: GENERIC_SAVE_ERROR };
  }
}

/**
 * Update an existing post's content (Requirement 11.2). Same guard + validation
 * gates as {@link createPost}.
 *
 * Intentionally edits CONTENT only (`title`, `slug`, `excerpt`, `content`,
 * `coverUrl`) and never touches `status`/`publishedAt`: the publish state is
 * owned solely by {@link setPostStatus}, so editing a published article cannot
 * accidentally unpublish it (and editing a draft cannot accidentally publish
 * it).
 */
export async function updatePost(
  id: string,
  input: PostMutationInput,
): Promise<ActionResult<{ id: string }>> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing post id." };
  }

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Strip status/publishedAt — those transition only through setPostStatus.
  const { status: _status, publishedAt: _publishedAt, ...content } =
    parsed.data;

  try {
    const updated = await prisma.post.update({
      where: { id },
      data: content,
    });
    revalidatePostSurfaces(updated.slug);
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    const conflict = slugConflictResult(error);
    if (conflict) return conflict;
    console.error("Failed to update post", error);
    return { success: false, formError: GENERIC_SAVE_ERROR };
  }
}

/**
 * Delete a post (Requirement 11.3). The confirmation prompt is a UI concern
 * (the admin delete dialog); this action performs the guarded removal and
 * revalidates so the deletion reflects publicly. Guarded by
 * {@link requireSession} (Property 7) before any write.
 */
export async function deletePost(id: string): Promise<ActionResult> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing post id." };
  }

  try {
    const deleted = await prisma.post.delete({ where: { id } });
    revalidatePostSurfaces(deleted.slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post", error);
    return {
      success: false,
      formError: "Something went wrong deleting the article. Please try again.",
    };
  }
}

/**
 * Transition a post between DRAFT and PUBLISHED (Requirements 11.4, 11.5;
 * Property 3). This is the single authority over public visibility.
 *
 *  - `PUBLISHED`: sets `status = PUBLISHED` and stamps `publishedAt = now`, so
 *    the post becomes visible on the homepage preview, the blog listing, and its
 *    article page (Req 11.4).
 *  - `DRAFT`: sets `status = DRAFT` and clears `publishedAt`, hiding the post
 *    from every public view (Req 11.5 / Property 3 — the public data layer only
 *    returns `status = PUBLISHED`).
 *
 * Guarded by {@link requireSession} (Property 7) before any write; an invalid
 * status value is rejected without a mutation.
 */
export async function setPostStatus(
  id: string,
  status: PostStatus,
): Promise<ActionResult> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing post id." };
  }

  const parsedStatus = postStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, formError: "Invalid post status." };
  }

  // Publishing stamps publishedAt; reverting to draft clears it (Property 3).
  const data =
    parsedStatus.data === PostStatus.PUBLISHED
      ? { status: PostStatus.PUBLISHED, publishedAt: new Date() }
      : { status: PostStatus.DRAFT, publishedAt: null };

  try {
    const updated = await prisma.post.update({ where: { id }, data });
    revalidatePostSurfaces(updated.slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to set post status", error);
    return {
      success: false,
      formError:
        "Something went wrong updating the article status. Please try again.",
    };
  }
}
