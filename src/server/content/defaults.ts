/**
 * Structural defaults for homepage sections and navigation.
 *
 * The homepage renders sections from the `HomepageSection` table. Each `key`
 * here maps to a renderer in `src/features/home/HomeSections.tsx`; the CMS
 * can enable/disable, reorder, and retitle them but cannot invent new keys
 * (that would need a renderer). Defaults reproduce the original portfolio
 * homepage, plus the Team section. Optional sections start disabled.
 */

export interface SectionDefault {
  key: string;
  label: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Defaults to true. */
  enabled?: boolean;
}

export const HOMEPAGE_SECTION_DEFAULTS: SectionDefault[] = [
  { key: "hero", label: "Hero" },
  { key: "craft", label: "3D scroll scene" },
  { key: "ticker", label: "Capability ticker" },
  { key: "stats", label: "By the numbers", eyebrow: "By the numbers", title: "Proven, measurable impact" },
  {
    key: "team",
    label: "Team",
    eyebrow: "The team",
    title: "Two specialists. One delivery team.",
    description:
      "Engineering depth on one side, enterprise IT operations and identity & access management on the other — so what we build is secure, supported, and ready for real users.",
  },
  { key: "work", label: "Featured projects", eyebrow: "Selected work", title: "Featured Projects" },
  { key: "skills", label: "Skills & expertise" },
  { key: "experience", label: "Experience" },
  { key: "testimonials", label: "References", eyebrow: "References", title: "Professional references" },
  { key: "blog", label: "Latest articles" },
  { key: "contact", label: "Contact" },
  { key: "services", label: "Services (optional)", eyebrow: "What we help with", title: "Services", enabled: false },
  { key: "process", label: "Process (optional)", eyebrow: "How we work", title: "From first conversation to launch", enabled: false },
  { key: "why-us", label: "Why us (optional)", eyebrow: "Why work with us", title: "Why work with us", enabled: false },
];

export const HOMEPAGE_SECTION_KEYS = HOMEPAGE_SECTION_DEFAULTS.map((s) => s.key);

export interface NavDefault {
  label: string;
  href: string;
  location: "HEADER" | "FOOTER";
}

export const NAVIGATION_DEFAULTS: NavDefault[] = [
  { label: "About", href: "/about", location: "HEADER" },
  { label: "Work", href: "/projects", location: "HEADER" },
  { label: "Capabilities", href: "/skills", location: "HEADER" },
  { label: "Experience", href: "/experience", location: "HEADER" },
  { label: "References", href: "/testimonials", location: "HEADER" },
  { label: "Insights", href: "/blog", location: "HEADER" },
];
