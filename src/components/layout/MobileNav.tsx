"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { NAV_LINKS, PRIMARY_CTA } from "./navigation";

export interface MobileNavProps {
  className?: string;
}

/**
 * `MobileNav` — the accessible small-screen navigation (Req 16.2, 15.2).
 *
 * Toggle pattern:
 * - A real `<button>` with `aria-expanded` reflecting open/closed state and
 *   `aria-controls` pointing at the panel's `id`. Its accessible name flips
 *   between "Open menu" and "Close menu" so assistive tech announces state.
 * - Opening reveals a panel listing the same {@link NAV_LINKS} plus the primary
 *   CTA. The panel closes when a link is activated, when `Escape` is pressed,
 *   and when the toggle is pressed again.
 *
 * Focus management: on open, focus moves to the panel (which is programmatically
 * focusable via `tabIndex={-1}`); on close, focus returns to the toggle button
 * so keyboard users keep a sensible position.
 *
 * Every interactive element is keyboard operable with a visible focus ring and
 * a >=44px touch target.
 */
export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Tracks whether the panel was open on the previous commit so we only restore
  // focus to the toggle on an actual close (never on initial mount).
  const wasOpenRef = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the panel when it opens; restore it to the toggle on close.
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    } else if (wasOpenRef.current) {
      // Transitioned from open -> closed: return focus to the toggle so the
      // keyboard user keeps a sensible position (the panel has unmounted).
      toggleRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-md",
          "text-text transition-colors hover:text-accent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 bg-current transition-opacity duration-200",
              open ? "opacity-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
            )}
          />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          tabIndex={-1}
          className={cn(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 max-w-[calc(100vw-2rem)] outline-none",
            "rounded-lg border border-hairline bg-card/95 backdrop-blur-md shadow-xl",
            "p-space-2",
          )}
        >
          <ul className="flex flex-col gap-space-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-11 items-center rounded-md px-space-2 text-body text-muted",
                    "transition-colors hover:bg-bg-secondary hover:text-text",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-space-2 border-t border-hairline pt-space-2">
            <Button
              href={PRIMARY_CTA.href}
              variant="primary"
              size="sm"
              className="w-full"
              onClick={close}
            >
              {PRIMARY_CTA.label}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
