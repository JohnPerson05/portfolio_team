"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "./variants";

export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Centralizes motion defaults for the whole app.
 *
 * `MotionConfig` with `reducedMotion="user"` makes framer-motion automatically
 * honor the user's `prefers-reduced-motion` setting for every descendant
 * animation, disabling transform/layout animation while keeping opacity. Our
 * custom primitives additionally short-circuit to their final state via the
 * `useReducedMotion` hook, giving defense-in-depth for Correctness Property 9.
 *
 * It also sets a shared default transition (ease-out) so any ad-hoc `motion`
 * usage inherits the same restrained curve.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {children}
    </MotionConfig>
  );
}
