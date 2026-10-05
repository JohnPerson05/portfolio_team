"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pageTransitionVariants } from "./variants";

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /**
   * A key that changes per route (e.g. the pathname). When used together with
   * framer-motion's `AnimatePresence` in the layout, changing this key triggers
   * the exit/enter cross-fade between routes.
   */
  routeKey?: string;
}

/**
 * Wraps page content in a subtle cross-fade + slight slide on route change.
 *
 * Reduced motion (Correctness Property 9): renders children with no motion
 * (final state immediately) when the user prefers reduced motion.
 */
export function PageTransition({
  children,
  className,
  routeKey,
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={routeKey}
      className={className}
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
