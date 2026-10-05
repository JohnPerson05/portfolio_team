import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { BRAND_NAME, NAV_LINKS, SOCIAL_LINKS, type NavLink } from "./navigation";

export interface FooterProps {
  /** Site name (CMS setting `studio.name`). */
  studioName?: string;
  /** Short paragraph under the brand (CMS setting `footer.text`). */
  text?: string;
  /** "Explore" links — the header navigation. */
  links?: readonly NavLink[];
  socialLinks?: readonly NavLink[];
  className?: string;
}

/**
 * `Footer` — the semantic site footer (server component).
 *
 * Renders the brand logo + tagline, the shared quick links, social profile
 * placeholders (GitHub/LinkedIn), and a copyright line with the current year.
 * All links are keyboard operable with a visible focus ring and adequate touch
 * targets; the content sits in a centered, max-width container with horizontal
 * padding so it never overflows the viewport (Property 12).
 */
export function Footer({
  studioName = BRAND_NAME,
  text = "Backend and full-stack engineering for enterprise systems, product integrations, and focused MVP delivery.",
  links = NAV_LINKS,
  socialLinks = SOCIAL_LINKS,
  className,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn("border-t border-hairline bg-bg-secondary", className)}
    >
      <div className="mx-auto w-full max-w-content px-space-2 py-space-8 sm:px-space-4">
        <div className="flex flex-col gap-space-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-space-3">
              <BrandLogo size={56} className="h-14 w-14" />
              <p className="font-display text-body-lg font-semibold tracking-tight text-text">
                {studioName}
              </p>
            </div>
            <p className="mt-space-3 text-pretty text-body text-muted">
              {text}
            </p>
          </div>

          <div className="flex flex-col gap-space-6 sm:flex-row sm:gap-space-12">
            {/* Quick links */}
            <nav aria-label="Footer">
              <h2 className="text-caption font-medium uppercase tracking-widest text-muted">
                Explore
              </h2>
              <ul className="mt-space-2 flex flex-col gap-space-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-md text-body text-muted",
                        "transition-colors hover:text-text",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {socialLinks.length > 0 ? (
              <div>
                <h2 className="text-caption font-medium uppercase tracking-widest text-muted">
                  Connect
                </h2>
                <ul className="mt-space-2 flex flex-col gap-space-1">
                  {socialLinks.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-md text-body text-muted",
                          "transition-colors hover:text-text",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        )}
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-space-8 border-t border-hairline pt-space-4">
          <p className="text-caption text-muted">
            &copy; {year} {studioName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
