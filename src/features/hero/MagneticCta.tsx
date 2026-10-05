"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";
import { MAGNETIC_SPRING } from "@/components/motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface MagneticCtaProps {
  children: ReactNode;
  className?: string;
  /** Maximum translation (px) the wrapper drifts toward the pointer. */
  strength?: number;
}

/**
 * `MagneticCta` — applies the shared magnetic pointer-follow motion to whatever
 * it wraps (here, the hero's primary CTA).
 *
 * Why a wrapper instead of `Button`'s built-in `magnetic` flag: the shared
 * {@link Button}'s magnetic mode renders a native `<button>` and is therefore
 * unavailable in link mode. The hero CTAs must be real, navigable `<a>` links
 * with stable `href`s (smooth-scroll to projects, etc.), so we keep the CTA a
 * `Button` link and add the drift on an inert wrapper element. The inner anchor
 * keeps its `href`, accessible name, and keyboard operability untouched.
 *
 * Reduced motion / touch (Property 9, Req 15.4): when the user prefers reduced
 * motion or has no fine pointer, the wrapper renders its children statically
 * with no transform — identical final layout, just no drift.
 */
export function MagneticCta({
  children,
  className,
  strength = 12,
}: MagneticCtaProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const magneticEnabled = !prefersReducedMotion && hasFinePointer;

  const ref = useRef<HTMLSpanElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, MAGNETIC_SPRING);
  const springY = useSpring(y, MAGNETIC_SPRING);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (!magneticEnabled) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      const clamp = (v: number, half: number) =>
        Math.max(-strength, Math.min(strength, (v / half) * strength));
      x.set(clamp(relX, rect.width / 2));
      y.set(clamp(relY, rect.height / 2));
    },
    [magneticEnabled, strength, x, y],
  );

  const handlePointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Static wrapper when magnetic motion is disabled — children unchanged.
  if (!magneticEnabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-flex" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.span>
  );
}
