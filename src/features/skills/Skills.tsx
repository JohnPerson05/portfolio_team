import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Card, EmptyState, SectionHeading, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SkillView } from "@/types";
import {
  PROFILE_SUMMARY,
  PROFILE_EXPERIENCE_YEARS,
  SKILLS_EYEBROW,
  SKILLS_HEADING,
  SKILL_CATEGORY_DESCRIPTIONS,
  groupSkills,
} from "./config";
import { getSkills } from "./data";
import { ProficiencyBar } from "./ProficiencyBar";

export interface SkillsProps {
  /**
   * Override the skills rendered. Defaults to a live query of all skills.
   * Primarily an injection seam for tests; production renders the live data
   * fetched from the shared Prisma client. The injected list is still run
   * through {@link groupSkills} so the four-category grouping and per-group
   * ordering (Requirement 4.1) hold either way.
   */
  skills?: readonly SkillView[];
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  /** Show the homepage link to the dedicated capabilities page. */
  showDetailLink?: boolean;
  /** Render a condensed capability overview instead of every proficiency bar. */
  compact?: boolean;
  className?: string;
}

/**
 * `Skills` — the homepage skills section (Requirement 4).
 *
 * A React Server Component: it fetches skills via the shared Prisma client
 * ({@link getSkills}) and groups them into the four {@link SkillCategory}
 * buckets — Frontend, Backend, Cloud, AI — via {@link groupSkills}, each group's
 * skills ordered by `order` ascending (Requirement 4.1). All four categories
 * render as groups even if a category has no skills, so the section structure
 * is deterministic.
 *
 * Each skill renders an animated {@link ProficiencyBar} (Requirement 4.2) that
 * fills from 0 to its target on in-view (Requirement 4.3) and shows the final
 * value immediately under reduced motion (Requirement 4.4 / Correctness
 * Property 9), via the shared in-view/count-up primitives.
 *
 * Motion (Requirement 4.3): a {@link Stagger} container orchestrates staggered
 * scroll-triggered reveals of each category group (wrapped in {@link FadeUp}),
 * honoring reduced motion via the shared primitives.
 *
 * Rendered as a `<section id="skills">` labelled by its heading for an
 * accessible landmark name. Each category group is itself a labelled region.
 */
export async function Skills({
  skills,
  eyebrow = SKILLS_EYEBROW,
  heading = SKILLS_HEADING,
  showDetailLink = true,
  compact = false,
  className,
}: SkillsProps) {
  const source = skills ?? (await getSkills());
  const groups = groupSkills(source);
  const headingId = "skills-heading";
  const hasAnySkill = groups.some((group) => group.skills.length > 0);

  return (
    <section
      id="skills"
      aria-labelledby={headingId}
      className={cn(
        "w-full bg-bg-secondary px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          description={
            compact
              ? "A focused overview of the engineering capabilities used across enterprise systems, full-stack products, cloud delivery, and rapid MVP development."
              : undefined
          }
          align="center"
          className="mx-auto"
        />

        {hasAnySkill ? (
          <>
            <FadeUp>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d10] p-space-4 sm:p-space-6">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center opacity-25"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #0a0d10 15%, transparent), url('/images/enterprise-grid-background.svg')",
                  }}
                />
                <div className="relative grid gap-space-6 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <div className="flex items-center gap-space-2 font-mono text-caption uppercase tracking-[0.18em] text-accent">
                      <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
                      Professional profile
                    </div>
                    <p className="mt-space-3 max-w-4xl text-pretty text-body-lg leading-relaxed text-text">
                      {PROFILE_SUMMARY}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-space-2">
                    <div className="rounded-lg border border-white/10 bg-black/20 px-space-3 py-space-2 backdrop-blur">
                      <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                        Experience
                      </dt>
                      <dd className="text-signal mt-1 font-display text-h3 font-semibold">
                        {PROFILE_EXPERIENCE_YEARS} years
                      </dd>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 px-space-3 py-space-2 backdrop-blur">
                      <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                        Focus
                      </dt>
                      <dd className="mt-1 font-display text-h3 font-semibold text-text">
                        Enterprise
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </FadeUp>

            {compact ? (
              <Stagger
                as="ul"
                className="grid grid-cols-1 gap-space-3 sm:grid-cols-2 xl:grid-cols-4"
              >
                {groups.map((group, groupIndex) => {
                  const groupHeadingId = `skills-${group.category.toLowerCase()}-heading`;
                  const highlightedSkills = group.skills.slice(0, 5);
                  const remainingSkills =
                    group.skills.length - highlightedSkills.length;

                  return (
                    <FadeUp
                      as="li"
                      key={group.category}
                      className="h-full list-none"
                    >
                      <Card
                        as="section"
                        aria-labelledby={groupHeadingId}
                        hover="border"
                        className="relative flex h-full flex-col overflow-hidden p-space-4"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute right-space-2 top-space-1 font-mono text-h1 font-semibold text-white/[0.025]"
                        >
                          0{groupIndex + 1}
                        </span>
                        <div className="border-accent/20 bg-accent/10 relative flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-caption font-semibold text-accent">
                          0{groupIndex + 1}
                        </div>
                        <h3
                          id={groupHeadingId}
                          className="relative mt-space-4 font-display text-h3 font-semibold tracking-tight text-text"
                        >
                          {group.label}
                        </h3>
                        <p className="relative mt-space-2 min-h-12 text-pretty text-caption leading-relaxed text-muted">
                          {SKILL_CATEGORY_DESCRIPTIONS[group.category]}
                        </p>

                        {highlightedSkills.length > 0 ? (
                          <ul className="relative mt-space-4 flex flex-wrap gap-space-1">
                            {highlightedSkills.map((skill) => (
                              <li key={skill.id}>
                                <Tag>{skill.name}</Tag>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="relative mt-space-4 font-sans text-body text-muted">
                            Coming soon.
                          </p>
                        )}

                        <div className="relative mt-auto border-t border-hairline pt-space-3">
                          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                            {remainingSkills > 0
                              ? `+${remainingSkills} more in full matrix`
                              : `${group.skills.length} key skill${group.skills.length === 1 ? "" : "s"}`}
                          </span>
                        </div>
                      </Card>
                    </FadeUp>
                  );
                })}
              </Stagger>
            ) : (
              <Stagger
                as="ul"
                className="grid grid-cols-1 gap-space-4 lg:grid-cols-2"
              >
                {groups.map((group, groupIndex) => {
                  const groupHeadingId = `skills-${group.category.toLowerCase()}-heading`;
                  return (
                    <FadeUp
                      as="li"
                      key={group.category}
                      className="h-full list-none"
                    >
                      <Card
                        as="section"
                        aria-labelledby={groupHeadingId}
                        className="relative flex h-full flex-col overflow-hidden p-space-4"
                      >
                        <div className="absolute right-space-3 top-space-2 font-mono text-hero font-semibold text-white/[0.025]">
                          0{groupIndex + 1}
                        </div>
                        <header className="relative mb-space-4 flex items-start gap-space-3 border-b border-hairline pb-space-3">
                          <span className="border-accent/20 bg-accent/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-caption font-semibold text-accent">
                            0{groupIndex + 1}
                          </span>
                          <div>
                            <h3
                              id={groupHeadingId}
                              className="font-display text-h3 font-semibold tracking-tight text-text"
                            >
                              {group.label}
                            </h3>
                            <p className="mt-1 max-w-md text-pretty text-caption text-muted">
                              {SKILL_CATEGORY_DESCRIPTIONS[group.category]}
                            </p>
                          </div>
                          <span className="px-space-1.5 ml-auto shrink-0 rounded-full border border-white/10 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                            {group.skills.length} skills
                          </span>
                        </header>

                        {group.skills.length > 0 ? (
                          <ul className="relative grid gap-space-2 sm:grid-cols-2">
                            {group.skills.map((skill) => (
                              <li key={skill.id}>
                                <ProficiencyBar
                                  name={skill.name}
                                  proficiency={skill.proficiency}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-sans text-body text-muted">
                            Coming soon.
                          </p>
                        )}
                      </Card>
                    </FadeUp>
                  );
                })}
              </Stagger>
            )}
          </>
        ) : (
          <EmptyState
            title="Skills coming soon"
            description="Technical skills will appear here once they're published."
          />
        )}
        {showDetailLink ? (
          <Link
            href="/skills"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            View the capability matrix&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
