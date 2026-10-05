import { HERO_CONTENT } from "@/features/hero/config";

/**
 * Shared navigation data for the layout shell (Task 11).
 *
 * A single source of truth consumed by the desktop {@link Navbar}, the
 * {@link MobileNav} drawer, and the {@link Footer} quick links so the public
 * navigation never drifts out of sync. Every showcase area has a dedicated
 * route while the homepage keeps the complete overview.
 */

/** A navigation entry pointing to an in-page homepage section. */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** A social profile link rendered in the footer. */
export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

/**
 * Brand wordmark shown in the navbar and footer.
 */
export const BRAND_NAME = HERO_CONTENT.name;

/** Path to the brand logo mark used across the public shell. */
export const BRAND_LOGO_SRC = "/images/brandlogo.png" as const;

/**
 * Primary in-page section links shared across the navbar, mobile drawer, and
 * footer. Hash anchors smooth-scroll to the matching homepage sections.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Work", href: "/projects" },
  { label: "Capabilities", href: "/skills" },
  { label: "Experience", href: "/experience" },
  { label: "References", href: "/testimonials" },
  { label: "Insights", href: "/blog" },
];

/** Prominent call-to-action surfaced in the navbar and mobile drawer. */
export const PRIMARY_CTA: NavLink = {
  label: "Start a project",
  href: "/contact",
};

/** Social profile placeholders (GitHub/LinkedIn) shown in the footer. */
export const SOCIAL_LINKS: readonly SocialLink[] = HERO_CONTENT.links;
