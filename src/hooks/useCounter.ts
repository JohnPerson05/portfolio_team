"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface UseCounterOptions {
  /** Final value to count up to. */
  target: number;
  /** Whether the animation should run. When `false`, the value stays at 0. */
  active?: boolean;
  /** Animation duration in milliseconds. Defaults to 1500ms. */
  duration?: number;
  /** Number of decimal places to display. Defaults to 0 (integers). */
  decimals?: number;
}

/**
 * Ease-out cubic — a smooth, professional deceleration with no overshoot.
 * Chosen deliberately over a spring so counters settle cleanly (no bounce).
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Animate a numeric value from 0 up to `target` over `duration` once `active`
 * becomes true, returning the current display value.
 *
 * Honors reduced motion (Correctness Property 9): when the user prefers reduced
 * motion the hook immediately returns `target` with no animation. It also
 * returns `target` instantly in environments without `requestAnimationFrame`.
 */
export function useCounter({
  target,
  active = true,
  duration = 1500,
  decimals = 0,
}: UseCounterOptions): number {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    // Reduced motion (or no rAF available): jump straight to the final value.
    if (
      prefersReducedMotion ||
      typeof window === "undefined" ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);
      const current = round(target * easeOutCubic(progress), decimals);
      setValue(current);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        // Guarantee we land exactly on the target.
        setValue(target);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [active, prefersReducedMotion, target, duration, decimals]);

  return value;
}
