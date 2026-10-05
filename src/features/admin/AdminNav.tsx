"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import {
  ADMIN_BRAND_NAME,
  ADMIN_LOGGING_OUT_LABEL,
  ADMIN_LOGOUT_LABEL,
  ADMIN_NAV_LINKS,
} from "./config";

export interface AdminNavProps {
  className?: string;
}

/**
 * `AdminNav` — the navigation bar inside the guarded admin shell (Req 9).
 *
 * Renders the brand wordmark, the primary admin links (Dashboard, Projects,
 * Blog, Contacts), and a logout control that invokes the {@link logout} Server
 * Action (Requirement 9.4 — clears the session cookie). It is a small client
 * island so it can highlight the active route via {@link usePathname} and run
 * the logout transition without blocking; the surrounding shell stays a Server
 * Component to keep the admin client bundle minimal (Performance Plan).
 *
 * Accessibility (Req 15.2): rendered as `<nav aria-label="Admin">`; the active
 * link is marked with `aria-current="page"`; the logout button is a real,
 * keyboard-operable control with a visible focus ring (via the Button
 * primitive).
 */
export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    startTransition(() => {
      // The action clears the cookie; the middleware then redirects any
      // subsequent admin navigation to the login page (Property 8).
      void logout();
    });
  };

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Admin"
      className={cn(
        "mx-auto flex h-16 w-full max-w-content items-center justify-between gap-space-3 px-space-2 sm:px-space-4",
        className,
      )}
    >
      <div className="flex items-center gap-space-3">
        <Link
          href="/admin"
          aria-label={ADMIN_BRAND_NAME}
          className={cn(
            "inline-flex shrink-0 items-center rounded-md",
            "transition-opacity hover:opacity-90",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          <BrandLogo size={36} className="h-9 w-9" />
        </Link>

        <ul className="flex items-center gap-space-1">
          {ADMIN_NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-space-2 text-body transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    active ? "text-accent" : "text-muted hover:text-text",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loggingOut || isPending}
      >
        {loggingOut || isPending ? ADMIN_LOGGING_OUT_LABEL : ADMIN_LOGOUT_LABEL}
      </Button>
    </nav>
  );
}
