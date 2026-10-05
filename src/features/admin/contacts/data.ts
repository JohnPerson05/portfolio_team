import prisma from "@/lib/prisma";
import { toContactSubmissionView, type ContactSubmissionView } from "@/types";
import { sortByRecency } from "./config";

/**
 * Data access for the admin contacts view (Requirement 12; Correctness
 * Property 10).
 *
 * Queries the shared Prisma client for every {@link ContactSubmission} ordered
 * most-recent-first (`createdAt` descending — Requirement 12.3 / Property 10)
 * and maps each row to the serializable {@link ContactSubmissionView} DTO so the
 * admin Server Component stays free of `Date`/nullable Prisma types
 * (Requirement 17.2). The result is passed through {@link sortByRecency} as a
 * defensive re-sort, so the recency-ordering invariant holds regardless of how
 * the data arrives.
 *
 * This page sits under the `(protected)` admin route group, so the guarded
 * layout's `requireSession()` gate already protects every read here
 * (Requirement 9.1 / Property 7).
 */
export async function getContactSubmissions(): Promise<
  ContactSubmissionView[]
> {
  const rows = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return sortByRecency(rows.map(toContactSubmissionView));
}

/** Load a single inquiry for the admin detail view. */
export async function getContactSubmissionById(
  id: string,
): Promise<ContactSubmissionView | null> {
  if (typeof id !== "string" || id.trim() === "") {
    return null;
  }

  const row = await prisma.contactSubmission.findUnique({
    where: { id },
  });

  return row ? toContactSubmissionView(row) : null;
}
