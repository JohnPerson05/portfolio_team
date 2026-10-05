"use client";

import { motion } from "framer-motion";
import { useMemo, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { StaggerContext } from "./stagger-context";
import { staggerContainerVariants } from "./variants";

export interface StaggerProps {
  children: ReactNode;
  /** Render as a different element (e.g. "ul", "section"). Defaults to "div". */
  as?: ElementType;
  className?: string;
  /** Reveal only once (default) or every time it enters the viewport. */
  once?: boolean;
}

/**
 * Container that orchestrates staggered reveals of its children (~0.08s step).
 * Pair with {@link FadeUp} children — they detect the surrounding Stagger and
 * defer their timing to this container.
 *
 * Reduced motion (Correctness Property 9): renders children in their final
 * visible state immediately, with no orchestration.
 */
export function Stagger({
  children,
  as = "div",
  className,
  once = true,
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ once });

  const MotionTag = useMemo(() => motion.create(as as ElementType), [as]);

  if (prefersReducedMotion) {
    const StaticTag = as;
    return (
      <StaggerContext.Provider value={false}>
        <StaticTag className={className}>{children}</StaticTag>
      </StaggerContext.Provider>
    );
  }

  return (
    <StaggerContext.Provider value={true}>
      <MotionTag
        ref={ref}
        className={className}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {children}
      </MotionTag>
    </StaggerContext.Provider>
  );
}
