/**
 * Hero section content + types (Task 12).
 *
 * The hero is intentionally driven by a small, typed configuration object so
 * the copy lives in one place and is trivial to edit. The shape mirrors what a
 * future CMS-backed source (e.g. a `SiteSettings` record) would provide, so the
 * section can later be fed from the database without changing its props.
 *
 * Requirements: 1.1 (photo, name, role, value proposition), 1.2/1.4/1.5/1.6
 * (the three CTA targets).
 */

/** A secondary link rendered beneath the hero CTAs (e.g. GitHub, LinkedIn). */
export interface HeroLink {
  readonly label: string;
  readonly href: string;
}

/** The complete, resolved content the hero renders. */
export interface HeroContent {
  /** Full name — shown as the page `<h1>`. Doubles as the avatar alt text. */
  readonly name: string;
  /** Professional role/title shown beneath the name. */
  readonly role: string;
  /** Short value proposition (one to two sentences). */
  readonly valueProposition: string;
  /** Path/URL to the avatar / portrait image (the binary need not exist for tests). */
  readonly avatarUrl: string;
  /** Path/URL to the wide cover image used behind the hero. */
  readonly coverUrl: string;
  /** Target for the "View Projects" CTA (Req 1.4). */
  readonly projectsHref: string;
  /** Target for the "Download Resume" CTA (Req 1.5). */
  readonly resumeHref: string;
  /** Target for the "Contact Me" CTA (Req 1.6). */
  readonly contactHref: string;
  /** Optional secondary links (social profiles, etc.). */
  readonly links: readonly HeroLink[];
}

/**
 * Default hero content. Placeholder identity/copy that the owner edits here (or
 * that a CMS overrides via {@link HeroProps}) — the CTA targets are the real,
 * stable in-page anchors and the resume route.
 */
export const HERO_CONTENT: HeroContent = {
  name: "John Person",
  role: "Backend / Full Stack Engineer · Freelancer",
  valueProposition:
    "Backend-focused engineer with approximately 6 years of experience building enterprise and web applications, rapid MVPs, reusable product interfaces, and reliable cloud delivery.",
  avatarUrl: "/images/profile.png",
  coverUrl: "/images/cover.png",
  projectsHref: "/projects",
  resumeHref: "/resume",
  contactHref: "/contact",
  links: [],
};
