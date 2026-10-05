"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useRef,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MAGNETIC_SPRING } from "./variants";

export interface MagneticButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onDragEnter"
    | "onDragExit"
    | "onDragLeave"
    | "onDragOver"
    | "onDrop"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "style"
  > {
  /** Maximum translation (px) the button drifts toward the pointer. */
  strength?: number;
  /** Inline styles merged with the magnetic transform. */
  style?: React.CSSProperties;
}

/**
 * A button that gently drifts toward the pointer while hovered and springs
 * cleanly back to center on leave (no overshoot/bounce).
 *
 * Accessibility & robustness:
 * - Always renders a real `<button>`; children, `onClick`, `type`, `aria-*`,
 *   and all other props are forwarded, so it keeps its accessible name and is
 *   fully keyboard operable.
 * - The magnetic effect is purely decorative transform; it is disabled (button
 *   stays static) when the user prefers reduced motion OR when there is no fine
 *   pointer (touch devices), per the task constraints.
 */
export const MagneticButton = forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(function MagneticButton(
  { strength = 12, children, className, style, onPointerMove, onPointerLeave, ...rest },
  forwardedRef,
) {
  const prefersReducedMotion = useReducedMotion();
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const magneticEnabled = !prefersReducedMotion && hasFinePointer;

  const localRef = useRef<HTMLButtonElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, MAGNETIC_SPRING);
  const springY = useSpring(y, MAGNETIC_SPRING);

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      if (!magneticEnabled) return;
      const node = localRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      // Clamp the drift to +/- strength so it stays within small bounds.
      const clamp = (v: number, half: number) =>
        Math.max(-strength, Math.min(strength, (v / half) * strength));
      x.set(clamp(relX, rect.width / 2));
      y.set(clamp(relY, rect.height / 2));
    },
    [magneticEnabled, onPointerMove, strength, x, y],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      // Spring back to rest.
      x.set(0);
      y.set(0);
    },
    [onPointerLeave, x, y],
  );

  // Static button when magnetic motion is disabled — still fully functional.
  if (!magneticEnabled) {
    return (
      <button ref={setRefs} className={className} style={style} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={setRefs}
      className={className}
      style={{ ...style, x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
