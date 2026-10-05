import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  index: string;
  status?: string;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  index,
  status = "Available for select projects",
  className,
}: PageHeroProps) {
  const headingId = `page-hero-${index.replace(/\W+/g, "-")}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative overflow-hidden border-b border-hairline px-space-2 pb-space-12 pt-space-10 sm:px-space-4 sm:pt-space-16",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--bg) 8%, transparent 58%), url('/images/cover.png')",
          }}
        />
        <div className="programmatic-grid absolute inset-0 opacity-40" />
        <div className="via-bg/15 absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <Stagger className="relative mx-auto grid max-w-content gap-space-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <FadeUp>
            <div className="mb-space-4 flex items-center gap-space-2 font-mono text-caption uppercase tracking-[0.2em] text-accent">
              <span>{index}</span>
              <span className="bg-accent/50 h-px w-10" />
              <span>{eyebrow}</span>
            </div>
          </FadeUp>
          <FadeUp>
            <h1
              id={headingId}
              className="text-balance font-display text-hero font-semibold tracking-[-0.045em] text-text"
            >
              {title}
            </h1>
          </FadeUp>
          <FadeUp>
            <p className="mt-space-4 max-w-2xl text-pretty text-body-lg leading-relaxed text-muted">
              {description}
            </p>
          </FadeUp>
        </div>

        <FadeUp>
          <div className="flex flex-col items-start gap-space-2 border-l border-hairline pl-space-3 lg:items-end lg:border-l-0 lg:pl-0">
            <span className="flex items-center gap-space-1 font-mono text-caption uppercase tracking-widest text-muted">
              <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
              {status}
            </span>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-text transition-colors hover:text-accent"
            >
              ← Back to overview
            </Link>
          </div>
        </FadeUp>
      </Stagger>
    </section>
  );
}
