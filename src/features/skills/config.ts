/**
 * Skills section configuration + grouping logic (Task 15).
 *
 * Requirement 4.1: the public skills section groups skills into four
 * categories — Frontend, Backend, Cloud, and AI — each rendered as a group of
 * skills ordered by `order` ascending. The category display order and
 * human-readable labels live here, and the pure {@link groupSkills} /
 * {@link clampProficiency} helpers keep the grouping invariant easily testable
 * and shared between the live data layer and the Server Component.
 */

import { SkillCategory } from "@prisma/client";
import type { SkillView } from "@/types";

/** Lowest proficiency value a bar can represent. */
export const MIN_PROFICIENCY = 0;
/** Highest proficiency value a bar can represent. */
export const MAX_PROFICIENCY = 100;

/** Default eyebrow label shown above the section heading. */
export const SKILLS_EYEBROW = "Capabilities";
/** Default section heading. */
export const SKILLS_HEADING = "Skills & Expertise";

export const PROFILE_SUMMARY =
  "Backend / Full Stack Engineer and freelancer with approximately 6 years of experience delivering enterprise applications, modern web products, and rapid MVPs. Specialized in Java, Spring Boot, microservices, system integration, and Azure DevOps, with hands-on React, Next.js, TypeScript, AI-assisted prototyping, and Vercel delivery.";

export const PROFILE_EXPERIENCE_YEARS = 6;

/**
 * The four skill categories in their public display order (Requirement 4.1).
 * The order is intentional — Frontend first, then Backend, Cloud, and AI — and
 * is the single source of truth for both rendering order and which groups must
 * always appear.
 */
export const SKILL_CATEGORY_ORDER: readonly SkillCategory[] = [
  SkillCategory.BACKEND,
  SkillCategory.CLOUD,
  SkillCategory.FRONTEND,
  SkillCategory.AI,
];

/** Human-readable labels for each {@link SkillCategory}. */
export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  [SkillCategory.FRONTEND]: "Frontend Development",
  [SkillCategory.BACKEND]: "Backend Engineering",
  [SkillCategory.CLOUD]: "Cloud & DevOps",
  [SkillCategory.AI]: "AI-Assisted Development & Delivery",
};

export const SKILL_CATEGORY_DESCRIPTIONS: Record<SkillCategory, string> = {
  [SkillCategory.BACKEND]:
    "Enterprise services, integrations, testing, and scalable architecture.",
  [SkillCategory.CLOUD]:
    "Automated delivery, cloud platforms, and production observability.",
  [SkillCategory.FRONTEND]:
    "Responsive, accessible interfaces connected to robust backend systems.",
  [SkillCategory.AI]:
    "AI-accelerated prototyping, product delivery, and collaborative engineering tools.",
};

/** A category paired with its label and the skills that belong to it. */
export interface SkillGroup {
  /** The category enum value (stable key). */
  category: SkillCategory;
  /** Human-readable category label (e.g. "Frontend"). */
  label: string;
  /** Skills in this category, ordered by `order` ascending. */
  skills: SkillView[];
}

/**
 * Clamp a proficiency value into the renderable 0–100 range
 * (Requirement 4: proficiency is 0–100). Non-finite values fall back to the
 * minimum so a bad row never produces an out-of-range / NaN bar width.
 */
export function clampProficiency(value: number): number {
  if (!Number.isFinite(value)) return MIN_PROFICIENCY;
  return Math.min(MAX_PROFICIENCY, Math.max(MIN_PROFICIENCY, value));
}

/**
 * Group skills into the four categories in {@link SKILL_CATEGORY_ORDER}
 * (Requirement 4.1), each group's skills sorted by `order` ascending
 * (Requirement 4.1). Always returns exactly four groups in the canonical order
 * — a category with no skills yields an empty `skills` array rather than being
 * omitted — so the section structure is deterministic and idempotent
 * (Correctness Property 11). The live query already orders by `order`; the
 * defensive re-sort keeps the invariant even for an unordered input (exercised
 * directly by unit tests).
 */
export function groupSkills(skills: readonly SkillView[]): SkillGroup[] {
  return SKILL_CATEGORY_ORDER.map((category) => ({
    category,
    label: SKILL_CATEGORY_LABELS[category],
    skills: skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => a.order - b.order),
  }));
}
