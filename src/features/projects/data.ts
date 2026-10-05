import prisma from "@/lib/prisma";
import { toProjectView, type ProjectView } from "@/types";
import { MAX_FEATURED, selectFeatured } from "./config";

/**
 * Fetch the featured projects for the public homepage (Requirement 3.1).
 *
 * Queries the shared Prisma client for `featured = true` projects ordered by
 * `order` ascending and capped at {@link MAX_FEATURED} at the database layer.
 * Rows are mapped to the serializable {@link ProjectView} DTO so the section
 * (and its client link islands) stay free of `Date`/nullable Prisma types
 * (Requirement 17.2). The result is passed through {@link selectFeatured} as a
 * defensive re-clamp/re-sort, so Correctness Property 1 holds regardless of how
 * the data arrives.
 */
export async function getFeaturedProjects(): Promise<ProjectView[]> {
  const rows = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
    take: MAX_FEATURED,
  });

  return selectFeatured(rows.map(toProjectView));
}

/** Fetch the complete public work archive, newest work first within its order. */
export async function getProjects(): Promise<ProjectView[]> {
  const rows = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toProjectView);
}

/** Fetch one public project by its stable slug. */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectView | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row ? toProjectView(row) : null;
}
