"use client";

import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";

export interface CounterProps {
  /** Final value to count up to when scrolled into view. */
  value: number;
  /** Text appended after the number, e.g. "+" or "%". */
  suffix?: string;
  /** Text prepended before the number, e.g. "$". */
  prefix?: string;
  /** Decimal places to display. Defaults to 0. */
  decimals?: number;
  /** Count-up duration in milliseconds. Defaults to 1500ms. */
  duration?: number;
  className?: string;
}

/** Format with thousands separators and fixed decimals. */
function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts up from 0 to `value` when scrolled into view.
 *
 * Reduced motion (Correctness Property 9): when the user prefers reduced
 * motion, the final value is displayed immediately with no counting animation
 * (the underlying {@link useCounter} hook short-circuits to `value`).
 */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration,
  className,
}: CounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ once: true });
  const display = useCounter({
    target: value,
    active: inView,
    duration,
    decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </span>
  );
}
