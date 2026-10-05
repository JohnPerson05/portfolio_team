"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { z } from "zod";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validation";
import { MAX_FEATURED, MIN_FEATURED } from "@/features/projects/config";
import { encodeProjectImages } from "@/features/projects/media";
import type { ActionResult } from "@/types";

/**
 * Admin project-management Server Actions (Requirement 10; Properties 1 & 7).
 *
 * Every mutating action here follows the "Admin mutation (guarded)" sequence
 * from design.md:
 *   1. {@link requireSession} re-check (defense-in-depth, Property 7 / Req 9.5).
 *      Middleware already guards `/admin` routes at the edge, but each action
 *      independently verifies the session so an unauthenticated caller can never
 *      reach a mutation. `requireSession` redirects (throws `NEXT_REDIRECT`) when
 *      no session is present, so the function does not return — and crucially,
 *      NO Prisma write runs.
 *   2. Zod validation via {@link projectSchema} (Req 10.4). On failure the action
 *      returns structured `fieldErrors` and writes nothing (Property 4 at the
 *      admin layer).
 *   3. Prisma mutation.
 *   4. {@link revalidatePath} for the public homepage (`/`) and the admin
 *      projects routes so changes reflect publicly without a redeploy
 *      (Req 10.1 / 10.2).
 *
 * The featured set/ordering is controlled by {@link reorderFeatured}, which keeps
 * the public "featured" count within {@link MIN_FEATURED}–{@link MAX_FEATURED}
 * (Req 10.5 / Property 1) and assigns a contiguous ascending `order`.
 */

/** Public homepage path to revalidate after a project mutation (Req 10.1/10.2). */
const PUBLIC_HOME_PATH = "/";
/** Public project archive and detail routes. */
const PUBLIC_PROJECTS_PATH = "/projects";
const PUBLIC_PROJECT_DETAIL_PATTERN = "/projects/[slug]";
/** Admin projects list path to revalidate after a mutation. */
const ADMIN_PROJECTS_PATH = "/admin/projects";

/**
 * Raw create/update input as held by the admin form (the Zod *input* type, so
 * fields with schema defaults — `featured`, `order` — are optional here).
 */
export type ProjectMutationInput = z.input<typeof projectSchema>;

/** Generic failure message for unexpected persistence errors. */
const GENERIC_SAVE_ERROR =
  "Something went wrong saving the project. Please try again.";

function toProjectData(parsed: z.infer<typeof projectSchema>) {
  const { imageUrls, thumbnailUrl, ...data } = parsed;
  const persistedImages =
    imageUrls.length > 0 ? imageUrls : thumbnailUrl ? [thumbnailUrl] : [];

  return {
    ...data,
    thumbnailUrl: encodeProjectImages(persistedImages),
  };
}

/** Revalidate the public homepage and the admin projects routes. */
function revalidateProjectSurfaces(): void {
  revalidatePath(PUBLIC_HOME_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECT_DETAIL_PATTERN, "page");
  revalidatePath(ADMIN_PROJECTS_PATH);
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
      fieldErrors: { slug: ["A project with this slug already exists"] },
    };
  }
  return null;
}

/**
 * Create a project (Requirement 10.1, 10.4). Guarded by {@link requireSession}
 * (Property 7) and validated by {@link projectSchema} (Req 10.4) before any
 * write. On success the public homepage and admin projects routes are
 * revalidated so the new project reflects publicly (Req 10.1).
 */
export async function createProject(
  input: ProjectMutationInput,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth re-check FIRST — redirects (throws) when unauthenticated; no write.
  await requireSession();

  // 2. Validate (Req 10.4). On failure return field errors; persist nothing.
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // 3. Persist.
  try {
    const created = await prisma.project.create({
      data: toProjectData(parsed.data),
    });
    // 4. Reflect on the public site + admin list (Req 10.1).
    revalidateProjectSurfaces();
    return { success: true, data: { id: created.id } };
  } catch (error) {
    const conflict = slugConflictResult(error);
    if (conflict) return conflict;
    console.error("Failed to create project", error);
    return { success: false, formError: GENERIC_SAVE_ERROR };
  }
}

/**
 * Update an existing project (Requirement 10.2, 10.4). Same guard + validation
 * gates as {@link createProject}; revalidates public + admin surfaces on success
 * so edits reflect publicly (Req 10.2).
 */
export async function updateProject(
  id: string,
  input: ProjectMutationInput,
): Promise<ActionResult<{ id: string }>> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing project id." };
  }

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: toProjectData(parsed.data),
    });
    revalidateProjectSurfaces();
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    const conflict = slugConflictResult(error);
    if (conflict) return conflict;
    console.error("Failed to update project", error);
    return { success: false, formError: GENERIC_SAVE_ERROR };
  }
}

/**
 * Delete a project (Requirement 10.3). The confirmation prompt is a UI concern
 * (the admin delete dialog); this action performs the guarded removal and
 * revalidates so the deletion reflects publicly. Guarded by
 * {@link requireSession} (Property 7) before any write.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing project id." };
  }

  try {
    await prisma.project.delete({ where: { id } });
    revalidateProjectSurfaces();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project", error);
    return {
      success: false,
      formError: "Something went wrong deleting the project. Please try again.",
    };
  }
}

/**
 * Set the featured project set and its display order (Requirement 10.5;
 * Property 1).
 *
 * `ids` is the ordered list of project ids to feature on the public homepage.
 * The action:
 *   - guards via {@link requireSession} (Property 7),
 *   - rejects malformed/duplicate selections,
 *   - enforces the public featured bound of {@link MIN_FEATURED}–
 *     {@link MAX_FEATURED} (Req 10.5 / Property 1) so the homepage always has a
 *     valid 3–6 set to render,
 *   - then, in a single transaction, clears `featured` on every project NOT in
 *     the list and sets `featured = true` with a contiguous ascending `order`
 *     (matching the array index) on each selected project.
 *
 * Because `order` mirrors the array position, the public query (ordered by
 * `order` ascending) renders the projects in exactly the chosen sequence.
 */
export async function reorderFeatured(ids: string[]): Promise<ActionResult> {
  await requireSession();

  // Structural validation: a non-empty array of non-empty string ids.
  if (
    !Array.isArray(ids) ||
    ids.some((id) => typeof id !== "string" || id.trim() === "")
  ) {
    return { success: false, formError: "Invalid project selection." };
  }

  // No duplicates — a project cannot appear twice in the featured order.
  if (new Set(ids).size !== ids.length) {
    return {
      success: false,
      formError: "A project cannot be featured more than once.",
    };
  }

  // Enforce the public featured bound (Req 10.5 / Property 1).
  if (ids.length < MIN_FEATURED || ids.length > MAX_FEATURED) {
    return {
      success: false,
      formError: `Featured projects must be between ${MIN_FEATURED} and ${MAX_FEATURED}.`,
    };
  }

  try {
    // Single transaction: unfeature the rest, then feature + order the selected.
    await prisma.$transaction([
      prisma.project.updateMany({
        where: { id: { notIn: ids } },
        data: { featured: false },
      }),
      ...ids.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { featured: true, order: index },
        }),
      ),
    ]);
    revalidateProjectSurfaces();
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder featured projects", error);
    return {
      success: false,
      formError:
        "Something went wrong updating featured projects. Please try again.",
    };
  }
}
