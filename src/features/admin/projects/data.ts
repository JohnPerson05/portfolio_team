import prisma from "@/lib/prisma";
import { toProjectView, type ProjectView } from "@/types";

/**
 * Admin project reads (Task 22). Unlike the public `getFeaturedProjects`
 * (which returns only `featured = true`, capped at 6), the admin CMS needs the
 * FULL catalogue so the owner can create/edit/delete and choose which projects
 * are featured.
 *
 * Rows are ordered featured-first, then by `order` ascending, then newest, so
 * the current public selection (and its display order) is obvious at the top of
 * the list. Results are mapped to the serializable {@link ProjectView} DTO so
 * the client islands (form, delete dialog, ordering controls) never receive raw
 * `Date`/nullable Prisma types (Requirement 17.2).
 */
export async function getAllProjects(): Promise<ProjectView[]> {
  const rows = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toProjectView);
}

/**
 * Fetch a single project for the edit page, or `null` when it does not exist
 * (so the route can render a not-found state).
 */
export async function getProjectById(
  id: string,
): Promise<ProjectView | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? toProjectView(row) : null;
}
