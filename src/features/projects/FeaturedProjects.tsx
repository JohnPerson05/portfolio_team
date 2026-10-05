import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { PROJECTS_EYEBROW, PROJECTS_HEADING, selectFeatured } from "./config";
import { getFeaturedProjects } from "./data";
import { ProjectCard } from "./ProjectCard";

export interface FeaturedProjectsProps {
  /**
   * Override the projects rendered. Defaults to a live query of featured
   * projects. Primarily an injection seam for tests; production renders the
   * live data fetched from the shared Prisma client.
   */
  projects?: readonly ProjectView[];
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  className?: string;
}

/**
 * `FeaturedProjects` — the homepage projects section (Requirement 3).
 *
 * A React Server Component: it fetches featured projects via the shared Prisma
 * client ({@link getFeaturedProjects}), ordered by `order` ascending and capped
 * at 6, then renders each as a {@link ProjectCard}. Callers may inject a
 * `projects` array (used by tests); the injected list is still run through
 * {@link selectFeatured} so the 3–6 ordered bound (Correctness Property 1)
 * holds either way.
 *
 * Motion (Requirement 3.6): a {@link Stagger} container orchestrates staggered
 * scroll-triggered reveals of the cards (each wrapped in {@link FadeUp}),
 * honoring reduced motion via the shared primitives (Property 9).
 *
 * Rendered as a `<section id="projects">` (the hero's "View Projects" CTA links
 * here) labelled by its heading for an accessible landmark name.
 */
export async function FeaturedProjects({
  projects,
  eyebrow = PROJECTS_EYEBROW,
  heading = PROJECTS_HEADING,
  className,
}: FeaturedProjectsProps) {
  const source = projects ?? (await getFeaturedProjects());
  const featured = selectFeatured(source);
  const headingId = "projects-heading";

  return (
    <section
      id="projects"
      aria-labelledby={headingId}
      className={cn(
        "w-full bg-bg px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          align="center"
          className="mx-auto"
        />

        {featured.length > 0 ? (
          <Stagger
            as="ul"
            className={cn(
              "grid grid-cols-1 gap-space-3 sm:gap-space-4",
              "md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {featured.map((project) => (
              <FadeUp as="li" key={project.id} className="h-full list-none">
                <ProjectCard project={project} />
              </FadeUp>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            title="Projects coming soon"
            description="Featured work will appear here once it's published."
          />
        )}
        <Link
          href="/projects"
          className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
        >
          Explore the full work archive&nbsp; →
        </Link>
      </div>
    </section>
  );
}
