import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { PROJECTS_EYEBROW, PROJECTS_HEADING, selectFeatured } from "./config";
import { getFeaturedProjects } from "./data";
import { ProjectCard } from "./ProjectCard";

export interface FeaturedProjectsProps {
  /** Projects to show. Defaults to the live featured/published query. */
  projects?: readonly ProjectView[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

/**
 * `FeaturedProjects` — the homepage "Selected work" section. Shows featured
 * published projects (or the newest published ones if none are featured),
 * ordered by their CMS display order, capped at six.
 */
export async function FeaturedProjects({
  projects,
  eyebrow = PROJECTS_EYEBROW,
  heading = PROJECTS_HEADING,
  description,
  className,
}: FeaturedProjectsProps) {
  const source = projects ?? (await getFeaturedProjects());
  const featured = selectFeatured(source);
  const headingId = "projects-heading";

  return (
    <section
      id="work"
      aria-labelledby={headingId}
      className={cn("w-full bg-bg px-space-2 py-section sm:px-space-4", className)}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          description={description}
          align="center"
          className="mx-auto"
        />

        {featured.length > 0 ? (
          <Stagger
            as="ul"
            className="grid grid-cols-1 gap-space-3 sm:gap-space-4 md:grid-cols-2 lg:grid-cols-3"
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
        {featured.length > 0 ? (
          <Link
            href="/work"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            See all our work&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
