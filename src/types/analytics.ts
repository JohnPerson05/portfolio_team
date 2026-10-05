import type { EventType } from "@prisma/client";

/**
 * Aggregated analytics shown on the admin dashboard (Requirement 13.6).
 * Produced by `getAnalyticsSummary()` (see task 8).
 */
export interface AnalyticsSummary {
  /** Count of PORTFOLIO_VIEW events. */
  totalViews: number;
  /** Count of PROJECT_CLICK events. */
  projectClicks: number;
  /** Count of RESUME_DOWNLOAD events. */
  resumeDownloads: number;
  /** Count of CONTACT_SUBMISSION events. */
  contactSubmissions: number;
  /** Most-clicked projects, ordered by click count descending. */
  topProjects: TopProject[];
  /** Most recent tracked events, newest first (optional). */
  recent?: RecentActivity[];
}

/** A project ranked by analytics click volume. */
export interface TopProject {
  projectId: string;
  title: string;
  clicks: number;
}

/** A single recent analytics event for the dashboard activity feed. */
export interface RecentActivity {
  id: string;
  type: EventType;
  /** Path the event was recorded on, when applicable. */
  path?: string | null;
  /** Associated project id for PROJECT_CLICK events, when applicable. */
  projectId?: string | null;
  createdAt: Date;
}
