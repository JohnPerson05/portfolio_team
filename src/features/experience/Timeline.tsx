import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Card, EmptyState, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ExperienceView } from "@/types";
import {
  EXPERIENCE_EYEBROW,
  EXPERIENCE_HEADING,
  getExperienceDateLabel,
  orderExperiences,
} from "./config";
import { getExperiences } from "./data";

export interface TimelineProps {
  /**
   * Override the experience entries rendered. Defaults to a live query of all
   * entries. Primarily an injection seam for tests; production renders the live
   * data fetched from the shared Prisma client. The injected list is still run
   * through {@link orderExperiences} so the chronological ordering invariant
   * (Requirement 5.1) holds either way.
   */
  experiences?: readonly ExperienceView[];
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  showDetailLink?: boolean;
  className?: string;
}

/**
 * `Timeline` — the homepage experience section (Requirement 5).
 *
 * A React Server Component: it fetches career-history entries via the shared
 * Prisma client ({@link getExperiences}), ordered chronologically
 * most-recent-first, and renders each as a timeline entry showing company,
 * position, tenure, impact, and key achievements (Requirement 5.1). Callers may
 * inject an `experiences` array (used by tests); the injected list is still run
 * through {@link orderExperiences} so the ordering invariant holds either way.
 *
 * Motion (Requirement 5.2): a {@link Stagger} container orchestrates staggered
 * scroll-triggered reveals of each entry (wrapped in {@link FadeUp}), guiding
 * attention sequentially down the timeline and honoring reduced motion via the
 * shared primitives.
 *
 * Layout (Requirement 5.3 / Correctness Property 12): a single-column ordered
 * list at every breakpoint, constrained to `max-w-content` with token-based
 * horizontal padding and no fixed widths, so the section never produces
 * horizontal overflow on mobile. A decorative accent rail/markers sit inside
 * the padded column rather than extending the layout width.
 *
 * Rendered as a `<section id="experience">` labelled by its heading for an
 * accessible landmark name; entries form a semantic ordered list.
 */
export async function Timeline({
  experiences,
  eyebrow = EXPERIENCE_EYEBROW,
  heading = EXPERIENCE_HEADING,
  showDetailLink = true,
  className,
}: TimelineProps) {
  const source = experiences ?? (await getExperiences());
  const entries = orderExperiences(source);
  const headingId = "experience-heading";

  return (
    <section
      id="experience"
      aria-labelledby={headingId}
      className={cn(
        "w-full bg-bg px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          align="center"
          className="mx-auto"
        />

        {entries.length > 0 ? (
          <Stagger
            as="ol"
            className={cn(
              // Single column at all breakpoints (Req 5.3 / Property 12).
              // A left accent rail is drawn as an inset border so it never
              // widens the layout; entries are inset to clear the markers.
              "relative flex flex-col gap-space-6",
              "border-l border-hairline pl-space-4 sm:pl-space-6",
            )}
          >
            {entries.map((entry) => {
              const titleId = `experience-${entry.id}-title`;
              const dateRange = getExperienceDateLabel(entry);
              const companyInitials = entry.company
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <FadeUp as="li" key={entry.id} className="relative list-none">
                  {/* Timeline marker — decorative, sits on the rail. The rail
                      is the list's left border; the marker is offset left of
                      the entry's content padding (space-4 = 32px / space-6 =
                      48px) by half its width to centre on the rail. */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[37px] top-1 h-2.5 w-2.5 rounded-full border border-accent bg-bg sm:-left-[53px]"
                  />
                  <Card
                    as="article"
                    aria-labelledby={titleId}
                    hover="border"
                    className="relative flex flex-col gap-space-4 overflow-hidden p-space-4 sm:p-space-5"
                  >
                    <div
                      aria-hidden="true"
                      className="programmatic-grid absolute inset-0 opacity-20"
                    />
                    <header className="relative flex items-start gap-space-3">
                      <div className="border-accent/20 bg-accent/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono text-caption font-semibold text-accent">
                        {companyInitials}
                      </div>
                      <div className="min-w-0">
                        <h3
                          id={titleId}
                          className="text-balance font-display text-h3 font-semibold tracking-tight text-text"
                        >
                          {entry.position}
                        </h3>
                        <p className="font-sans text-body font-medium text-accent">
                          {entry.company}
                        </p>
                        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                          {dateRange}
                        </p>
                      </div>
                      {entry.endDate === null ? (
                        <span className="px-space-1.5 ml-auto flex shrink-0 items-center gap-space-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 py-1 font-mono text-[0.58rem] uppercase tracking-wider text-emerald-300">
                          <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Current
                        </span>
                      ) : null}
                    </header>

                    <p className="border-accent/40 relative text-pretty border-l-2 pl-space-3 font-sans text-body text-text">
                      {entry.impact}
                    </p>

                    {entry.achievements.length > 0 ? (
                      <div className="relative flex flex-col gap-space-2">
                        <h4 className="font-mono text-[0.65rem] font-medium uppercase tracking-widest text-muted">
                          Selected contributions
                        </h4>
                        <ul className="flex list-disc flex-col gap-space-1 pl-space-4 marker:text-accent">
                          {entry.achievements.map((achievement) => (
                            <li
                              key={achievement}
                              className="text-pretty font-sans text-body text-muted"
                            >
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Card>
                </FadeUp>
              );
            })}
          </Stagger>
        ) : (
          <EmptyState
            title="Experience coming soon"
            description="Career history will appear here once it's published."
          />
        )}
        {showDetailLink ? (
          <Link
            href="/experience"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            Explore the full journey&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
