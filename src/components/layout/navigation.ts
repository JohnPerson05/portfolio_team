import { STUDIO } from "@/features/studio/config";

/**
 * Shared navigation data for the layout shell.
 *
 * A single source of truth consumed by the desktop {@link Navbar}, the
 * {@link MobileNav} drawer, and the {@link Footer} so the public navigation
 * never drifts out of sync.
 */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

/** Brand wordmark shown in the navbar and footer. */
export const BRAND_NAME = STUDIO.name;

/** Path to the brand logo mark used across the public shell. */
export const BRAND_LOGO_SRC = "/images/brandlogo.png" as const;

/**
 * Primary links — written for business visitors. Technical background pages
 * (toolkit, experience) live in the footer under {@link BACKGROUND_LINKS}.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/about" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/projects" },
  { label: "Process", href: "/#process" },
  { label: "Insights", href: "/blog" },
];

/** Secondary, more technical pages — surfaced quietly in the footer. */
export const BACKGROUND_LINKS: readonly NavLink[] = [
  { label: "The toolkit", href: "/skills" },
  { label: "John's background", href: "/experience" },
  { label: "References", href: "/testimonials" },
];

/** Prominent call-to-action surfaced in the navbar and mobile drawer. */
export const PRIMARY_CTA: NavLink = {
  label: "Start a project",
  href: "/contact",
};

/** Studio social profiles shown in the footer (add verified links only). */
export const SOCIAL_LINKS: readonly SocialLink[] = STUDIO.links;
