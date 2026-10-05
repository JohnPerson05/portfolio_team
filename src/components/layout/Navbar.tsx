"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { MobileNav } from "./MobileNav";
import { useSiteChrome } from "./SiteChrome";

export interface NavbarProps {
  className?: string;
}

/**
 * `Navbar` — the sticky, translucent top navigation for the public site.
 *
 * Layout (Req 16.1, 16.2):
 * - Brand logo on the left, in-page section anchors centered/right on
 *   desktop, and a primary CTA. Below the `md` breakpoint the inline links and
 *   CTA are hidden and the accessible {@link MobileNav} toggle takes over.
 * - The bar is `sticky` with a subtle backdrop blur and a hairline bottom
 *   border that strengthens once the page is scrolled, for a premium feel
 *   without gradient clutter.
 *
 * Accessibility (Req 15.2): rendered as `<header><nav aria-label="Primary">`;
 * every link/CTA is a real, keyboard-operable element with a visible
 * `:focus-visible` ring inherited from the global token and the Button
 * primitive. The container clips horizontal overflow (Property 12).
 *
 * Client component: it tracks a small amount of scroll state to toggle the
 * translucency/border treatment and owns the mobile drawer's open state.
 */
export function Navbar({ className }: NavbarProps) {
  const { studioName, headerLinks, cta } = useSiteChrome();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "supports-[backdrop-filter]:bg-bg/60 bg-bg/90 backdrop-blur-md",
        "border-b transition-colors duration-300",
        scrolled ? "border-hairline" : "border-transparent",
        className,
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-space-3 px-space-2 sm:px-space-4"
      >
        <Link
          href="/"
          aria-label={studioName}
          className={cn(
            "inline-flex shrink-0 items-center rounded-md",
            "transition-opacity hover:opacity-90",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          {/* Decorative: the link is already named by aria-label. */}
          <BrandLogo size={40} priority className="h-10 w-10" alt="" />
          <span className="ml-space-2 hidden font-display text-body font-semibold tracking-tight text-text lg:inline">
            {studioName}
          </span>
        </Link>

        {/* Desktop inline links — hidden on small screens. */}
        <ul className="hidden items-center gap-space-1 md:flex">
          {headerLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-md px-space-2 text-body text-muted",
                  "transition-colors hover:text-text",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA — hidden on small screens. */}
        <div className="hidden md:block">
          <Button href={cta.href} variant="primary" size="sm">
            {cta.label}
          </Button>
        </div>

        {/* Mobile toggle + drawer — hidden from the `md` breakpoint up. */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
