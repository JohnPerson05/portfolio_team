"use client";

import type { ReactNode } from "react";
import { EventType } from "@prisma/client";
import { recordEvent } from "@/actions/analytics";
import { cn } from "@/lib/utils";

export interface ProjectLinkProps {
  /** Destination URL. Caller guarantees this is non-empty (Property 2). */
  href: string;
  /** ID of the project this link belongs to (associates the analytics event). */
  projectId: string;
  /** Visible link label (e.g. "GitHub", "Live Demo"). */
  children: ReactNode;
  /** Optional leading icon, hidden from assistive tech. */
  icon?: ReactNode;
  className?: string;
}

/**
 * `ProjectLink` — the interactive island for a project's GitHub / Live Demo
 * action (Requirement 3.5).
 *
 * On activation it records a `PROJECT_CLICK` analytics event associated with
 * the project and opens the link in a new tab. The anchor itself carries
 * `target="_blank"` + `rel="noopener noreferrer"`, so the navigation happens
 * natively (and still works without JS / under keyboard activation) while the
 * click handler fires the tracking call alongside it.
 *
 * Non-blocking analytics (Properties 5 & 6 / Requirement 13.7): `recordEvent`
 * is itself fire-and-forget and never throws to the caller, but we additionally
 * invoke it without `await` and guard the call so navigation is never delayed
 * or blocked by analytics. A rejected promise is swallowed defensively.
 */
export function ProjectLink({
  href,
  projectId,
  children,
  icon,
  className,
}: ProjectLinkProps) {
  const handleClick = () => {
    // Fire-and-forget: do not await, do not let a rejection bubble.
    void Promise.resolve(
      recordEvent({ type: EventType.PROJECT_CLICK, projectId, path: href }),
    ).catch(() => {
      /* analytics must never disrupt the visitor experience */
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-md text-body font-medium text-muted",
        "transition-colors hover:text-accent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {icon != null ? (
        <span aria-hidden="true" className="[&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
      ) : null}
      {children}
    </a>
  );
}
