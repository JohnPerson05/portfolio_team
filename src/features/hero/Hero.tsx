import { FadeUp, Stagger } from "@/components/motion";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { HERO_CONTENT, type HeroContent, type HeroLink } from "./config";
import { DuoComposition } from "./DuoComposition";
import { MagneticCta } from "./MagneticCta";

/**
 * Props for {@link Hero}. Every field is optional and falls back to
 * {@link HERO_CONTENT} (sourced from the studio config).
 */
export interface HeroProps {
  eyebrow?: string;
  headline?: string;
  headlineAccent?: string;
  supporting?: string;
  primaryCta?: HeroContent["primaryCta"];
  secondaryCta?: HeroContent["secondaryCta"];
  availability?: string;
  links?: readonly HeroLink[];
  className?: string;
}

function resolveContent(props: HeroProps): HeroContent {
  return {
    eyebrow: props.eyebrow ?? HERO_CONTENT.eyebrow,
    headline: props.headline ?? HERO_CONTENT.headline,
    headlineAccent: props.headlineAccent ?? HERO_CONTENT.headlineAccent,
    supporting: props.supporting ?? HERO_CONTENT.supporting,
    primaryCta: props.primaryCta ?? HERO_CONTENT.primaryCta,
    secondaryCta: props.secondaryCta ?? HERO_CONTENT.secondaryCta,
    availability: props.availability ?? HERO_CONTENT.availability,
    links: props.links ?? HERO_CONTENT.links,
  };
}

/**
 * `Hero` — the studio statement that opens the homepage.
 *
 * Communicates three things in the first viewport: two people, digital
 * products, business impact. The left column carries the statement and two
 * CTAs (start a project / see the work); the right column is the interactive
 * {@link DuoComposition} — the two team members as one unit.
 *
 * Server Component; only the motion wrappers, the magnetic CTA, and the duo
 * composition hydrate as client islands. Reduced-motion aware throughout.
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
        <div className="programmatic-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(212,175,55,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[-15rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-[var(--accent-cool)] opacity-[0.04] blur-3xl"
      />

      <Stagger
        className={cn(
          "relative mx-auto grid w-full max-w-content items-center gap-space-10",
          "lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]",
        )}
      >
        <div className="flex flex-col items-start gap-space-4">
          <FadeUp>
            <div className="flex items-center gap-space-2 rounded-full border border-white/10 bg-white/[0.03] px-space-2 py-space-1">
              <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
              <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                <span>{content.eyebrow}</span>
                <span aria-hidden="true"> · </span>
                <span>{content.availability}</span>
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <h1
              id={headingId}
              className="text-balance font-display text-hero font-semibold tracking-[-0.045em] text-text"
            >
              {content.headline}{" "}
              <span className="text-signal">{content.headlineAccent}</span>
            </h1>
          </FadeUp>

          <FadeUp>
            <p className="max-w-xl text-pretty font-sans text-body-lg leading-relaxed text-muted">
              {content.supporting}
            </p>
          </FadeUp>

          <FadeUp className="w-full">
            <div className="flex flex-wrap items-center gap-space-2">
              <MagneticCta className="inline-flex">
                <Button
                  href={content.primaryCta.href}
                  variant="primary"
                  size="lg"
                  className="whitespace-nowrap"
                >
                  {content.primaryCta.label}
                  <span aria-hidden="true">→</span>
                </Button>
              </MagneticCta>
              <Button
                href={content.secondaryCta.href}
                variant="outline"
                size="lg"
                className="whitespace-nowrap"
              >
                {content.secondaryCta.label}
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
          <DuoComposition />
        </FadeUp>
      </Stagger>
    </section>
  );
}
