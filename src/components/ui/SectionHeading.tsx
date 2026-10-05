import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Heading levels a {@link SectionHeading} can render as. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface SectionHeadingProps {
  /** Main heading text. */
  heading: ReactNode;
  /** Small label/eyebrow shown above the heading (accent, used sparingly). */
  eyebrow?: ReactNode;
  /** Optional supporting copy shown beneath the heading. */
  description?: ReactNode;
  /**
   * Semantic heading level rendered (`h1`–`h6`). Defaults to `2`. The visual
   * size is fixed (fluid `h2` scale) regardless of level so document outline
   * and appearance stay decoupled.
   */
  level?: HeadingLevel;
  /**
   * `id` applied to the heading element so a section can reference it with
   * `aria-labelledby`.
   */
  id?: string;
  /** Horizontal alignment. Defaults to `left`. */
  align?: "left" | "center";
  className?: string;
}

/**
 * `SectionHeading` — eyebrow + heading + optional description using the display
 * font and the fluid type scale. Always renders a real heading element
 * (`level`, default `h2`) and accepts an `id` so the containing `<section>` can
 * set `aria-labelledby` for an accessible landmark name.
 */
export function SectionHeading({
  heading,
  eyebrow,
  description,
  level = 2,
  id,
  align = "left",
  className,
}: SectionHeadingProps) {
  const Heading = `h${level}` as const;
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("flex flex-col gap-space-2", alignment, className)}>
      {eyebrow ? (
        <span className="font-sans text-caption font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </span>
      ) : null}
      <Heading
        id={id}
        className="font-display text-h2 font-semibold text-text text-balance"
      >
        {heading}
      </Heading>
      {description ? (
        <p className="max-w-content font-sans text-body-lg text-muted text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}
