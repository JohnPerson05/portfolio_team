import { FadeUp, Stagger } from "@/components/motion";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { HERO_CONTENT, type HeroContent, type HeroLink } from "./config";
import { MagneticCta } from "./MagneticCta";
import { HeroPortrait } from "./HeroPortrait";

/**
 * Props for {@link Hero}. Every field is optional and falls back to
 * {@link HERO_CONTENT}, so the section renders complete content out of the box
 * while remaining fully overridable (today via props, later via a CMS source
 * that maps onto this same shape).
 */
export interface HeroProps {
  /** Full name — rendered as the page `<h1>` and the avatar's alt text. */
  name?: string;
  /** Professional role/title. */
  role?: string;
  /** Short value proposition shown beneath the role. */
  valueProposition?: string;
  /** Avatar / portrait image path/URL (binary need not exist for tests). */
  avatarUrl?: string;
  /** Wide cover image used behind the hero. */
  coverUrl?: string;
  /** Override the "View Projects" CTA target (Req 1.4). */
  projectsHref?: string;
  /** Override the "Download Resume" CTA target (Req 1.5). */
  resumeHref?: string;
  /** Override the "Contact Me" CTA target (Req 1.6). */
  contactHref?: string;
  /** Optional secondary links. */
  links?: readonly HeroLink[];
  className?: string;
}

/** Resolve incoming props against the default content. */
function resolveContent(props: HeroProps): HeroContent {
  return {
    name: props.name ?? HERO_CONTENT.name,
    role: props.role ?? HERO_CONTENT.role,
    valueProposition: props.valueProposition ?? HERO_CONTENT.valueProposition,
    avatarUrl: props.avatarUrl ?? HERO_CONTENT.avatarUrl,
    coverUrl: props.coverUrl ?? HERO_CONTENT.coverUrl,
    projectsHref: props.projectsHref ?? HERO_CONTENT.projectsHref,
    resumeHref: props.resumeHref ?? HERO_CONTENT.resumeHref,
    contactHref: props.contactHref ?? HERO_CONTENT.contactHref,
    links: props.links ?? HERO_CONTENT.links,
  };
}

/**
 * `Hero` — the full-screen opening section of the homepage (Requirement 1).
 *
 * Content (Req 1.1): a professional avatar, the candidate's name as the page
 * `<h1>`, their role, and a short value proposition. Three primary CTAs (Req
 * 1.2) link to the projects section (`#projects`, Req 1.4), the resume route
 * (`/resume`, Req 1.5), and the contact section (`#contact`, Req 1.6). The
 * primary CTA is magnetic for a premium feel.
 *
 * Motion (Req 1.3): a single {@link Stagger} orchestrates subtle fade-up
 * reveals of the text block, CTAs, and avatar — no bouncy effects. All motion
 * is reduced-motion aware via the shared primitives (Property 9 / Req 15.4).
 *
 * Layout (Req 1.7 / Property 12): mobile-first single column that stacks the
 * copy above the avatar, expanding to a two-column layout from `lg`. The
 * section fills the viewport height minus the 4rem (`h-16`) sticky navbar and
 * never produces horizontal overflow.
 *
 * Landmark: rendered as a `<section id="top">` (the navbar brand links to
 * `#top`) labelled by the `<h1>`. It is a Server Component; only the motion
 * wrappers and magnetic CTA hydrate as client islands.
 */
export function Hero(props: HeroProps) {
  const content = resolveContent(props);
  const headingId = "hero-heading";

  return (
    <section
      id="top"
      aria-labelledby={headingId}
      className={cn(
        "relative flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden",
        "px-space-2 py-space-10 sm:px-space-4 sm:py-space-12",
        props.className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `linear-gradient(90deg, var(--bg) 8%, transparent 55%), url('${content.coverUrl}')`,
          }}
        />
        <div className="programmatic-grid absolute inset-0 opacity-35" />
        <div className="from-bg/40 absolute inset-0 bg-gradient-to-b via-bg/20 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/35" />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[-15rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-[var(--accent-cool)] opacity-[0.035] blur-3xl"
      />
      <Stagger
        className={cn(
          "relative mx-auto grid w-full max-w-content items-center gap-space-10",
          "lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.88fr)]",
        )}
      >
        <div className="flex flex-col items-start gap-space-3">
          <FadeUp>
            <div className="flex items-center gap-space-2 rounded-full border border-white/10 bg-white/[0.03] px-space-2 py-space-1">
              <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
              <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                <span>{content.role}</span>
                <span aria-hidden="true"> · </span>
                <span>Freelance engagements</span>
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <h1
              id={headingId}
              className="text-signal text-balance font-display text-hero font-semibold tracking-[-0.055em]"
            >
              {content.name}
            </h1>
          </FadeUp>

          <FadeUp>
            <p className="max-w-2xl text-pretty font-sans text-body-lg leading-relaxed text-muted">
              {content.valueProposition}
            </p>
          </FadeUp>

          <FadeUp>
            <div className="flex flex-wrap items-center gap-x-space-3 gap-y-space-1 font-mono text-caption uppercase tracking-wider text-muted">
              <span className="text-text">Backend systems</span>
              <span aria-hidden="true" className="text-accent">
                /
              </span>
              <span className="text-text">Full-stack delivery</span>
              <span aria-hidden="true" className="text-accent">
                /
              </span>
              <span className="text-text">MVP prototyping</span>
            </div>
          </FadeUp>

          {/* Three primary CTAs (Req 1.2), kept on one consistent row. */}
          <FadeUp className="w-full">
            <div className="grid w-full grid-cols-3 items-center gap-space-1 sm:flex sm:flex-nowrap sm:gap-space-2">
              <MagneticCta className="inline-flex w-full sm:w-auto">
                <Button
                  href={content.projectsHref}
                  variant="primary"
                  size="md"
                  className="w-full whitespace-nowrap px-1.5 text-[0.58rem] min-[380px]:px-space-2 min-[380px]:text-caption sm:w-auto sm:px-space-3 sm:text-body"
                >
                  View Projects
                </Button>
              </MagneticCta>

              <Button
                type="button"
                variant="outline"
                size="md"
                disabled
                aria-disabled="true"
                title="Résumé download is currently unavailable"
                className="w-full whitespace-nowrap px-1.5 text-[0.58rem] min-[380px]:px-space-2 min-[380px]:text-caption sm:w-auto sm:px-space-3 sm:text-body"
              >
                Download Resume
              </Button>

              <Button
                href={content.contactHref}
                variant="ghost"
                size="md"
                className="w-full whitespace-nowrap px-1.5 text-[0.58rem] min-[380px]:px-space-2 min-[380px]:text-caption sm:w-auto sm:px-space-3 sm:text-body"
              >
                Contact Me
              </Button>
            </div>
          </FadeUp>

          {content.links.length > 0 ? (
            <FadeUp className="w-full">
              <ul className="flex flex-wrap items-center gap-space-3 pt-space-1">
                {content.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-md text-body text-muted",
                        "transition-colors hover:text-text",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FadeUp>
          ) : null}
        </div>

        <FadeUp>
          <div className="relative">
            <HeroPortrait src={content.avatarUrl} name={content.name} />
          </div>
        </FadeUp>
      </Stagger>
    </section>
  );
}
