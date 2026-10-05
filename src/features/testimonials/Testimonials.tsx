import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TestimonialView } from "@/types";
import {
  TESTIMONIALS_EYEBROW,
  TESTIMONIALS_HEADING,
  hasMedia,
  hasReferencePhoto,
  orderTestimonials,
} from "./config";
import { getTestimonials } from "./data";
import { ReferenceAvatar, ReferenceLogo } from "./ReferenceMedia";

export interface TestimonialsProps {
  /**
   * Override the testimonials rendered. Defaults to a live query of all
   * testimonials. Primarily an injection seam for tests; production renders the
   * live data fetched from the shared Prisma client. The injected list is still
   * run through {@link orderTestimonials} so the display-ordering invariant
   * (Requirement 6.1) holds either way.
   */
  testimonials?: readonly TestimonialView[];
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  showDetailLink?: boolean;
  className?: string;
}

/**
 * `Testimonials` — the homepage testimonials section (Requirement 6).
 *
 * A React Server Component: it fetches endorsements via the shared Prisma
 * client ({@link getTestimonials}), ordered by `order` ascending, and renders
 * each as a card showing the quote, author name, and author role/company
 * (Requirement 6.1). Callers may inject a `testimonials` array (used by tests);
 * the injected list is still run through {@link orderTestimonials} so the
 * ordering invariant holds either way.
 *
 * Optional media (Requirement 6.2): an author profile photo (`avatarUrl`) and a
 * company logo (`logoUrl`) are rendered via `next/image` if and only if their
 * URL is non-empty (via {@link hasMedia}); when absent, the card renders
 * gracefully without them and the layout stays intact — no broken/empty image.
 *
 * Motion (Requirement 6.3): a {@link Stagger} container orchestrates staggered
 * scroll-triggered reveals of the cards (each wrapped in {@link FadeUp}),
 * honoring reduced motion via the shared primitives (Correctness Property 9).
 *
 * Rendered as a `<section id="testimonials">` labelled by its heading for an
 * accessible landmark name; each card is a semantic
 * `<figure>`/`<blockquote>`/`<figcaption>`.
 */
export async function Testimonials({
  testimonials,
  eyebrow = TESTIMONIALS_EYEBROW,
  heading = TESTIMONIALS_HEADING,
  showDetailLink = true,
  className,
}: TestimonialsProps) {
  const source = testimonials ?? (await getTestimonials());
  const entries = orderTestimonials(source);
  const headingId = "testimonials-heading";

  return (
    <section
      id="testimonials"
      aria-labelledby={headingId}
      className={cn(
        "relative w-full overflow-hidden bg-bg-secondary px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="programmatic-grid pointer-events-none absolute inset-0 opacity-[0.12]"
      />
      <div className="relative mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          description="A recommendation-style view of professional relationships, delivery context, and trusted collaboration."
          align="left"
        />

        <FadeUp>
          <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-space-3 border-b border-hairline px-space-4 py-space-4 sm:flex-row sm:items-center sm:justify-between sm:px-space-5">
              <div>
                <p className="font-display text-h3 font-semibold text-text">
                  Recommendations
                </p>
                <p className="mt-space-1 font-sans text-caption text-muted">
                  Professional feedback shared with role and company context.
                </p>
              </div>
              <span className="border-accent/25 bg-accent/[0.07] inline-flex w-fit items-center gap-space-1 rounded-full border px-space-2 py-space-1 font-mono text-[0.65rem] uppercase tracking-widest text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Available privately
              </span>
            </div>

            <div
              aria-label="Reference categories"
              className="flex border-b border-hairline px-space-4 sm:px-space-5"
            >
              <span className="relative inline-flex min-h-12 items-center px-space-1 font-sans text-body font-semibold text-text">
                Received
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
              </span>
            </div>

            {entries.length > 0 ? (
              <Stagger as="ul" className="divide-y divide-hairline">
                {entries.map((testimonial) => {
                  const authorId = `testimonial-${testimonial.id}-author`;
                  const showAvatar = hasReferencePhoto(testimonial.avatarUrl);
                  const showLogo = hasMedia(testimonial.logoUrl);
                  const initials = testimonial.author
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <FadeUp as="li" key={testimonial.id} className="list-none">
                      <figure
                        aria-labelledby={authorId}
                        className="p-space-4 transition-colors hover:bg-white/[0.025] sm:p-space-5"
                      >
                        <figcaption className="flex items-center gap-space-3">
                          <ReferenceAvatar
                            url={showAvatar ? testimonial.avatarUrl : undefined}
                            author={testimonial.author}
                            initials={initials}
                          />

                          <div className="flex min-w-0 flex-1 flex-col">
                            <span
                              id={authorId}
                              className="font-display text-body-lg font-semibold text-text"
                            >
                              {testimonial.author}
                            </span>
                            <span className="text-pretty font-sans text-caption leading-relaxed text-muted">
                              {testimonial.company
                                ? `${testimonial.role}, ${testimonial.company}`
                                : testimonial.role}
                            </span>
                          </div>

                          {showLogo ? (
                            <ReferenceLogo
                              url={testimonial.logoUrl as string}
                              company={testimonial.company}
                              author={testimonial.author}
                            />
                          ) : null}
                        </figcaption>

                        <blockquote className="border-accent/40 mt-space-4 text-pretty border-l-2 pl-space-3 font-sans text-body-lg leading-relaxed text-text">
                          <p>&ldquo;{testimonial.quote}&rdquo;</p>
                        </blockquote>
                      </figure>
                    </FadeUp>
                  );
                })}
              </Stagger>
            ) : (
              <div className="grid gap-space-5 px-space-4 py-space-6 sm:px-space-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex gap-space-3">
                  <span
                    aria-hidden="true"
                    className="border-accent/25 bg-accent/[0.08] flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-display text-body font-semibold text-accent"
                  >
                    JPN
                  </span>
                  <div>
                    <h3 className="font-display text-h3 font-semibold text-text">
                      References available on request
                    </h3>
                    <p className="mt-space-2 max-w-2xl text-pretty font-sans text-body leading-relaxed text-muted">
                      Professional references are shared privately and matched
                      to the role, engagement, or delivery context being
                      discussed.
                    </p>
                    <ul className="mt-space-3 flex flex-wrap gap-space-2">
                      {[
                        "Context matched",
                        "Shared privately",
                        "Available on request",
                      ].map((label) => (
                        <li
                          key={label}
                          className="rounded-full border border-hairline bg-bg-secondary px-space-2 py-space-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted"
                        >
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button href="/contact" variant="outline" size="md">
                  Request a reference
                </Button>
              </div>
            )}
          </div>
        </FadeUp>
        {showDetailLink ? (
          <Link
            href="/testimonials"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            Professional references&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
