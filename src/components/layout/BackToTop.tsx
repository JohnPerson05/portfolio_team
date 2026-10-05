"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface BackToTopProps {
  className?: string;
}

const VISIBILITY_THRESHOLD = 480;

/** Global floating control for returning to the start of any page. */
export function BackToTop({ className }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const updateVisibility = () =>
      setVisible(window.scrollY >= VISIBILITY_THRESHOLD);

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        })
      }
      className={cn(
        "fixed bottom-space-4 right-space-3 z-50 flex h-12 w-12 items-center justify-center rounded-full",
        "border-accent/30 bg-card/90 border text-accent shadow-[0_14px_45px_-16px_rgba(0,0,0,0.9)] backdrop-blur-md",
        "transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-bg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:hover:translate-y-0",
        "sm:bottom-space-5 sm:right-space-5",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="m6 14 6-6 6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
