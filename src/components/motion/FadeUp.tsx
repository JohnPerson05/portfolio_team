"use client";

import { motion } from "framer-motion";
import { useMemo, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsInsideStagger } from "./stagger-context";
import { fadeUpVariants } from "./variants";

export interface FadeUpProps {
  children: ReactNode;
  /** Render as a different element (e.g. "li", "section"). Defaults to "div". */
  as?: ElementType;
  className?: string;
  /** Extra delay (seconds) before the reveal begins (ignored inside Stagger). */
  delay?: number;
  /** Reveal only once (default) or every time it enters the viewport. */
  once?: boolean;
}

/**
 * Reveal wrapper: fades in and rises (opacity 0→1, y 16→0) over ~0.5s ease-out
 * when scrolled into view.
 *
 * When rendered inside a {@link Stagger} container it defers its timing to the
 * parent (variant propagation), so the container orchestrates the sequence.
 *
 * Reduced motion (Correctness Property 9): when the user prefers reduced
 * motion, children are rendered in their final, fully visible state immediately
 * (opacity 1, y 0) with no transition.
 */
export function FadeUp({
  children,
  as = "div",
  className,
  delay = 0,
  once = true,
}: FadeUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const insideStagger = useIsInsideStagger();
  const { ref, inView } = useInView<HTMLElement>({ once });

  const MotionTag = useMemo(() => motion.create(as as ElementType), [as]);

  if (prefersReducedMotion) {
    // Final visible state, no animation.
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  // Inside a Stagger: be a passive variant child. The parent drives initial/
  // animate state and the per-child delay via `staggerChildren`.
  if (insideStagger) {
    return (
      <MotionTag className={className} variants={fadeUpVariants}>
        {children}
      </MotionTag>
    );
  }

  // Standalone: manage our own in-view reveal.
  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
