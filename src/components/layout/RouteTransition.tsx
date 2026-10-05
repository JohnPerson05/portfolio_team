"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion";

export interface RouteTransitionProps {
  children: ReactNode;
}

/**
 * `RouteTransition` — wires the current pathname into {@link PageTransition} so
 * navigating between routes cross-fades the page content.
 *
 * `AnimatePresence` (with `mode="wait"`) keys the transition on the pathname;
 * `PageTransition` itself short-circuits to a plain wrapper under
 * `prefers-reduced-motion`, so this stays fully reduced-motion compliant
 * (Correctness Property 9). Client component because it reads `usePathname`.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={pathname} routeKey={pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
