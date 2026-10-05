"use client";

import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";
import { cn } from "@/lib/utils";
import { MAX_PROFICIENCY, MIN_PROFICIENCY, clampProficiency } from "./config";

export interface ProficiencyBarProps {
  /** Skill name shown as the bar's label and used for its accessible name. */
  name: string;
  /** Target proficiency level, 0–100. */
  proficiency: number;
  className?: string;
}

/**
 * `ProficiencyBar` — an animated skill proficiency indicator (Requirement 4.2).
 *
 * The fill grows from 0 up to the skill's target level when the bar scrolls
 * into view (Requirement 4.3). Both the fill width and the visible percentage
 * are driven by the shared {@link useCounter} primitive, so the animation reuses
 * the same in-view + count-up machinery as the trust-section {@link Counter}.
 *
 * Reduced motion (Requirement 4.4 / Correctness Property 9): {@link useCounter}
 * returns the target immediately when the user prefers reduced motion, so the
 * bar renders its final width and final percentage instantly with no animation.
 *
 * Accessibility: the bar is a `role="progressbar"` exposing
 * `aria-valuenow`/`min`/`max` set to the true target proficiency (not the
 * mid-animation value), with an accessible name derived from the skill, so
 * assistive tech always announces the real skill level.
 */
export function ProficiencyBar({
  name,
  proficiency,
  className,
}: ProficiencyBarProps) {
  const target = clampProficiency(proficiency);
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });
  const display = useCounter({ target, active: inView });
  const level =
    target >= 92 ? "Expert" : target >= 86 ? "Advanced" : "Proficient";

  return (
    <div
      ref={ref}
      className={cn(
        "group/skill hover:border-accent/30 relative overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.025] p-space-2 transition-colors hover:bg-white/[0.045]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-space-2">
        <div className="flex min-w-0 items-center gap-space-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_rgba(212,175,55,0.45)]"
          />
          <span className="truncate font-sans text-caption font-medium text-text">
            {name}
          </span>
        </div>
        <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-wider text-muted">
          {level}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${name} proficiency`}
        aria-valuenow={target}
        aria-valuemin={MIN_PROFICIENCY}
        aria-valuemax={MAX_PROFICIENCY}
        className="mt-space-2 h-px w-full overflow-hidden bg-white/10"
      >
        <div
          className="h-full bg-gradient-to-r from-accent to-[var(--accent-cool)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${display}%` }}
        />
      </div>
      <span className="sr-only">{display}%</span>
    </div>
  );
}
