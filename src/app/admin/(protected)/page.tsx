import { Card, EmptyState, SectionHeading } from "@/components/ui";
import { getAnalyticsSummary } from "@/actions/analytics";
import type { AnalyticsSummary } from "@/types";

/**
 * Admin analytics dashboard (`/admin`) — the landing page of the guarded shell
 * (Requirement 13.6; Property 7).
 *
 * STRUCTURE — why `(protected)`: this page lives under the `(protected)` route
 * group so it inherits the guarded admin layout (`layout.tsx` calls
 * `requireSession`). The route group does not change the URL, so this still
 * resolves to `/admin`. The auth guard (Property 7 / Requirement 9.1) is owned
 * by that layout and `middleware.ts`; this page therefore relies on the guarded
 * segment rather than re-implementing the redirect, consistent with the other
 * protected admin pages.
 *
 * It is a Server Component (no client JS) that reads the aggregated metrics via
 * {@link getAnalyticsSummary} and renders them as accessible stat cards plus a
 * top-projects ranking. Aggregation/auth live elsewhere; this page is pure
 * presentation over the {@link AnalyticsSummary} DTO.
 */

/** A single headline metric rendered as a stat card. */
interface MetricCard {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

/** Map the summary DTO onto the four headline metrics, in display order. */
function toMetricCards(summary: AnalyticsSummary): MetricCard[] {
  return [
    { id: "total-views", label: "Total views", value: summary.totalViews },
    {
      id: "project-clicks",
      label: "Project clicks",
      value: summary.projectClicks,
    },
    {
      id: "resume-downloads",
      label: "Resume downloads",
      value: summary.resumeDownloads,
    },
    {
      id: "contact-submissions",
      label: "Contact submissions",
      value: summary.contactSubmissions,
    },
  ];
}

/** Format a metric for display (locale-aware thousands separators). */
function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function AdminDashboardPage() {
  const summary = await getAnalyticsSummary();
  const metrics = toMetricCards(summary);
  const topProjectsHeadingId = "top-projects-heading";

  return (
    <div className="flex flex-col gap-space-8">
      <SectionHeading
        level={1}
        eyebrow="Dashboard"
        heading="Analytics overview"
        description="Aggregated engagement across your portfolio."
      />

      {/* Headline metrics. A description list pairs each value with its label
          so screen readers announce "Total views: 42" rather than a bare
          number (Req 15.2). */}
      <dl className="grid grid-cols-1 gap-space-2 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            hover="border"
            className="flex flex-col gap-space-1 px-space-3 py-space-4"
          >
            <dt className="font-sans text-caption font-medium uppercase tracking-widest text-muted">
              {metric.label}
            </dt>
            <dd className="font-display text-h2 font-bold tracking-tight text-text">
              {formatCount(metric.value)}
            </dd>
          </Card>
        ))}
      </dl>

      {/* Top projects ranking (title + click count). */}
      <section aria-labelledby={topProjectsHeadingId} className="flex flex-col gap-space-4">
        <SectionHeading
          id={topProjectsHeadingId}
          level={2}
          heading="Top projects"
          description="Most-clicked projects, ranked by visitor engagement."
        />

        {summary.topProjects.length === 0 ? (
          <EmptyState
            title="No project clicks yet"
            description="Once visitors start exploring your work, your most-clicked projects will appear here."
          />
        ) : (
          <Card className="px-space-2 py-space-2 sm:px-space-4">
            <ol className="flex flex-col">
              {summary.topProjects.map((project, index) => (
                <li
                  key={project.projectId}
                  className="flex items-center justify-between gap-space-3 border-b border-hairline py-space-3 last:border-b-0"
                >
                  <span className="flex min-w-0 items-center gap-space-3">
                    <span
                      aria-hidden="true"
                      className="font-display text-body-lg font-semibold tabular-nums text-muted"
                    >
                      {index + 1}
                    </span>
                    <span className="truncate font-sans text-body text-text">
                      {project.title}
                    </span>
                  </span>
                  <span className="shrink-0 font-sans text-body text-muted">
                    {formatCount(project.clicks)}{" "}
                    {project.clicks === 1 ? "click" : "clicks"}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </section>
    </div>
  );
}
