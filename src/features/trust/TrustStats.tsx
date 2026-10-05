import Link from "next/link";
import { Counter } from "@/components/motion";
import { Card, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TRUST_STATS, type TrustStat } from "./config";

/**
 * Props for {@link TrustStats}. `stats` defaults to {@link TRUST_STATS} so the
 * section renders complete content out of the box while remaining overridable
 * (today via props, later via a CMS source that maps onto this same shape).
 */
export interface TrustStatsProps {
  /** Override the metrics rendered. Defaults to {@link TRUST_STATS}. */
  stats?: readonly TrustStat[];
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  showDetailLink?: boolean;
  className?: string;
}

/**
 * `TrustStats` — the quantified credibility section of the homepage
 * (Requirement 2). Renders the five metrics (Years of Experience, Projects
 * Completed, Technologies, Certifications, Awards — Req 2.1) as a responsive
 * grid of stat cards.
 *
 * Each metric shows an animated {@link Counter} that increments from 0 to its
 * target when the section scrolls into view (Req 2.2) and then displays the
 * final static value (Req 2.3), plus its label. Values support an optional
 * suffix (e.g. "+").
 *
 * Reduced motion (Req 2.4 / Correctness Property 9): the {@link Counter}
 * primitive already renders its final value immediately when the user prefers
 * reduced motion, so the section simply relies on it — the displayed final
 * values are correct regardless of whether the animation runs.
 *
 * Layout (Property 12): a mobile-first grid that shows 2 columns on small
 * screens and expands to all 5 across at `lg`, never producing horizontal
 * overflow. Rendered as a `<section id="trust">` labelled by its heading for an
 * accessible landmark name. It is a Server Component; only the per-value
 * {@link Counter} islands hydrate.
 */
export function TrustStats({
  stats = TRUST_STATS,
  eyebrow = "By the numbers",
  heading = "Proven, measurable impact",
  showDetailLink = true,
  className,
}: TrustStatsProps) {
  const headingId = "trust-heading";

  return (
    <section
      id="trust"
      aria-labelledby={headingId}
      className={cn(
        "w-full bg-bg-secondary px-space-2 py-section sm:px-space-4",
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

        <dl
          className={cn(
            "grid grid-cols-2 gap-space-2 sm:gap-space-3",
            "lg:grid-cols-5",
          )}
        >
          {stats.map((stat) => (
            <Card
              key={stat.id}
              hover="border"
              className="flex flex-col items-center gap-space-1 px-space-2 py-space-4 text-center"
            >
              <dt className="order-2 font-sans text-caption font-medium uppercase tracking-widest text-muted">
                {stat.label}
              </dt>
              <dd className="order-1 font-display text-h2 font-bold tracking-tight text-text">
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
            </Card>
          ))}
        </dl>
        {showDetailLink ? (
          <Link
            href="/about"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            About the engineering practice&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
