import type { SpringOptions, Variants } from "framer-motion";

/**
 * Centralized motion design tokens (Requirement 17.5).
 *
 * Every motion primitive and feature section imports its easing, durations,
 * and variants from here so the whole site shares one consistent, restrained
 * motion language: smooth ease-out reveals, gentle stagger, and clean-settling
 * springs — no bounce or overshoot.
 */

/** Cubic-bezier ease-out curve. Decelerates smoothly with no overshoot. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Standard durations (seconds). */
export const DURATION = {
  fast: 0.3,
  base: 0.5,
  slow: 0.7,
} as const;

/** Stagger step between children in a container reveal (seconds). */
export const STAGGER_STEP = 0.08;

/** Distance (px) reveal elements travel along the Y axis. */
export const FADE_UP_DISTANCE = 16;

/**
 * Spring used for the magnetic button pointer-follow. Tuned to settle cleanly
 * back to rest with no visible bounce (high enough damping, no overshoot).
 */
export const MAGNETIC_SPRING: SpringOptions = {
  stiffness: 260,
  damping: 30,
  mass: 0.6,
};

/**
 * Fade-up reveal: opacity 0 → 1 and y 16 → 0 over ~0.5s ease-out.
 * Shared by {@link FadeUp} and any section that reveals on scroll.
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: FADE_UP_DISTANCE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/**
 * Stagger container: orchestrates child reveals with a small step delay.
 * Pairs with {@link fadeUpVariants} children.
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_STEP,
      delayChildren: 0.05,
    },
  },
};

/**
 * Page transition: subtle cross-fade with a slight upward slide on enter and
 * downward slide on exit. Kept minimal so route changes feel calm.
 */
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: EASE_OUT },
  },
};
