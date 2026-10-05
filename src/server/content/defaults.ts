/**
 * Structural defaults for homepage sections and navigation.
 *
 * The homepage renders sections from the `HomepageSection` table. Each `key`
 * here maps to a renderer in `src/features/home/HomeSections.tsx`; the CMS
 * can enable/disable, reorder, and retitle them but cannot invent new keys
 * (that would need a renderer). The seed writes these rows; the public site
 * also falls back to them if the table is empty.
 */

export interface SectionDefault {
  key: string;
  label: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export const HOMEPAGE_SECTION_DEFAULTS: SectionDefault[] = [
  { key: "hero", label: "Hero" },
  { key: "ticker", label: "Outcome ticker" },
  {
    key: "team",
    label: "Team",
    eyebrow: "The team",
    title: "Two people. One digital product team.",
    description:
      "One of us builds the product. The other makes sure it's secure, reliable, and looked after. Together, we cover the whole journey — so you don't have to coordinate five different people.",
  },
  {
    key: "services",
    label: "Services",
    eyebrow: "What we help with",
    title: "From the first idea to the thing your business actually needs.",
    description:
      "You don't need to know how it's built. Tell us what's slowing you down — we'll handle the rest.",
  },
  {
    key: "process",
    label: "Process",
    eyebrow: "How we work",
    title: "From first conversation to a product that keeps working.",
  },
  {
    key: "work",
    label: "Selected work",
    eyebrow: "Selected work",
    title: "Real problems, solved.",
    description:
      "Each story starts with a business problem, explains what was built, and ends with what got better.",
  },
  {
    key: "stats",
    label: "Numbers",
    eyebrow: "By the numbers",
    title: "Enterprise experience, small-team attention",
  },
  {
    key: "why-us",
    label: "Why us",
    eyebrow: "Why a two-person team",
    title: "Small on purpose. Serious about the work.",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    eyebrow: "Kind words",
    title: "What people say about working with us",
  },
  {
    key: "contact",
    label: "Call to action",
    eyebrow: "Start a project",
    title: "Let's build something your customers will love.",
  },
];

export const HOMEPAGE_SECTION_KEYS = HOMEPAGE_SECTION_DEFAULTS.map((s) => s.key);

export interface NavDefault {
  label: string;
  href: string;
  location: "HEADER" | "FOOTER";
}

export const NAVIGATION_DEFAULTS: NavDefault[] = [
  { label: "Studio", href: "/about", location: "HEADER" },
  { label: "Services", href: "/services", location: "HEADER" },
  { label: "Work", href: "/work", location: "HEADER" },
  { label: "Process", href: "/#process", location: "HEADER" },
  { label: "Insights", href: "/blog", location: "HEADER" },
  { label: "The toolkit", href: "/skills", location: "FOOTER" },
  { label: "John's background", href: "/experience", location: "FOOTER" },
  { label: "References", href: "/testimonials", location: "FOOTER" },
];
