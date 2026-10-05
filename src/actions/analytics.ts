"use server";

import { EventType } from "@prisma/client";

import prisma from "@/lib/prisma";
import type { AnalyticsSummary, RecentActivity, TopProject } from "@/types";

/**
 * Analytics Server Actions (Requirement 13; Properties 5 & 6).
 *
 * Two responsibilities live here:
 *  - {@link recordEvent}: the write path used across the public site to persist
 *    a tracked interaction. It is deliberately *non-blocking* — any failure is
 *    logged and swallowed so analytics can never break the visitor experience
 *    (Property 6, Requirement 13.7).
 *  - {@link getAnalyticsSummary}: the read/aggregation path used by the admin
 *    dashboard (Requirement 13.6). Callers MUST guard this behind a valid
 *    session (see `requireSession` / the admin dashboard in task 25); this
 *    function performs aggregation only and does not enforce auth itself.
 */

/** How many projects to surface in the "top projects" ranking. */
const TOP_PROJECTS_LIMIT = 5;
/** How many recent events to include in the dashboard activity feed. */
const RECENT_ACTIVITY_LIMIT = 10;

export interface RecordEventInput {
  type: EventType;
  projectId?: string;
  path?: string;
}

/**
 * Persist exactly one {@link AnalyticsEvent} of the given type (Property 5,
 * Requirements 13.1–13.5).
 *
 * Non-blocking by contract (Property 6, Requirement 13.7): the database write
 * is wrapped in try/catch. On failure the error is logged via `console.error`
 * and swallowed — this function never rejects, so a caller (e.g. a page load,
 * a project-link click, the resume route, or the contact action) is never
 * disrupted because analytics failed.
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        projectId: input.projectId,
        path: input.path,
      },
    });
  } catch (error) {
    // Swallow: analytics must never degrade the visitor-facing experience.
    console.error("Failed to record analytics event", error);
  }
}

/**
 * Aggregate analytics for the admin dashboard (Requirement 13.6).
 *
 * NOTE: this performs aggregation only. The caller (admin dashboard) is
 * responsible for session-guarding access — see `requireSession` (task 10) and
 * the dashboard wiring (task 25).
 *
 * Aggregation strategy:
 *  - Per-type counts via a single `groupBy` on `type` (one query for all four
 *    metrics rather than four separate counts).
 *  - Top projects via a `groupBy` on `projectId` over `PROJECT_CLICK` events,
 *    ordered by click count descending, then joined to project titles.
 *  - Recent activity via a bounded `findMany` ordered newest-first.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [countsByType, topProjects, recentEvents] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    aggregateTopProjects(),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_ACTIVITY_LIMIT,
    }),
  ]);

  const recent: RecentActivity[] = recentEvents.map((event) => ({
    id: event.id,
    type: event.type,
    path: event.path,
    projectId: event.projectId,
    createdAt: event.createdAt,
  }));

  return {
    totalViews: countFor(countsByType, EventType.PORTFOLIO_VIEW),
    projectClicks: countFor(countsByType, EventType.PROJECT_CLICK),
    resumeDownloads: countFor(countsByType, EventType.RESUME_DOWNLOAD),
    contactSubmissions: countFor(countsByType, EventType.CONTACT_SUBMISSION),
    topProjects,
    recent,
  };
}

/** Per-type grouped count rows returned by Prisma's `groupBy`. */
type TypeCountRow = { type: EventType; _count: { _all: number } };

/** Look up the count for a given event type, defaulting to 0 when absent. */
function countFor(rows: TypeCountRow[], type: EventType): number {
  return rows.find((row) => row.type === type)?._count._all ?? 0;
}

/**
 * Rank projects by `PROJECT_CLICK` volume (descending) and resolve their
 * titles. `projectId` is nullable on the event, so null groups are excluded
 * before joining to the `Project` table.
 */
async function aggregateTopProjects(): Promise<TopProject[]> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["projectId"],
    where: { type: EventType.PROJECT_CLICK, projectId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { projectId: "desc" } },
    take: TOP_PROJECTS_LIMIT,
  });

  // Defensive null-narrowing: the `where` excludes nulls, but the generated
  // type still allows `string | null` for the grouped key.
  const ranked = grouped
    .filter(
      (row): row is { projectId: string; _count: { _all: number } } =>
        row.projectId !== null,
    )
    .map((row) => ({ projectId: row.projectId, clicks: row._count._all }));

  if (ranked.length === 0) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: { id: { in: ranked.map((row) => row.projectId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(projects.map((p) => [p.id, p.title]));

  // Preserve the click-descending order from `groupBy`; fall back to a generic
  // label if a project was deleted after its clicks were recorded.
  return ranked.map((row) => ({
    projectId: row.projectId,
    title: titleById.get(row.projectId) ?? "(deleted project)",
    clicks: row.clicks,
  }));
}
