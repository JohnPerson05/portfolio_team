import Link from "next/link";
import { Card, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { hasLink } from "./config";
import { ProjectLink } from "./ProjectLink";
import { ProjectVisual } from "./ProjectVisual";

export interface ProjectCardProps {
  /** The project to render. */
  project: ProjectView;
  className?: string;
}

/** Minimal GitHub mark used for the source-code link (decorative). */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="presentation">
      <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22v3.29c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

/** Minimal "external link" glyph used for the live demo link (decorative). */
function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="presentation"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/**
 * `ProjectCard` — a single featured-project card (Requirement 3.2).
 *
 * Renders the thumbnail, title/summary, a Problem → Solution → Impact
 * narrative, the technology stack as {@link Tag}s, and — conditionally — the
 * GitHub and Live Demo action links.
 *
 * Link integrity (Correctness Property 2 / Requirement 3.3): each action link
 * is rendered if and only if its URL is non-empty (via {@link hasLink}); absent
 * URLs produce no element at all rather than an empty/broken link. The links
 * are interactive {@link ProjectLink} islands that record a `PROJECT_CLICK`
 * event and open in a new tab (Requirement 3.5).
 *
 * Premium hover (Requirement 3.4): a subtle lift + accent border via the shared
 * {@link Card} `hover="lift"` treatment, using design tokens — no flashy motion.
 *
 * Server-safe and presentational; only the per-link {@link ProjectLink} islands
 * hydrate.
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const showGithub = hasLink(project.githubUrl);
  const showLive = hasLink(project.liveUrl);

  return (
    <Card
      as="article"
      hover="lift"
      aria-labelledby={`project-${project.id}-title`}
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <ProjectVisual
        title={project.title}
        thumbnailUrl={project.thumbnailUrl}
        technologies={project.technologies}
        href={`/projects/${project.slug}`}
      />

      <div className="flex flex-1 flex-col gap-space-3 p-space-3 sm:p-space-4">
        <div className="flex flex-col gap-space-1">
          <h3
            id={`project-${project.id}-title`}
            className="text-balance font-display text-h3 font-semibold tracking-tight text-text"
          >
            <Link
              href={`/projects/${project.slug}`}
              className="transition-colors hover:text-accent"
            >
              {project.title}
            </Link>
          </h3>
          <p className="text-pretty font-sans text-body text-muted">
            {project.summary}
          </p>
        </div>

        {project.technologies.length > 0 ? (
          <ul aria-label="Technologies" className="flex flex-wrap gap-space-1">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <Tag>{tech}</Tag>
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-space-2">
          <dt className="font-mono text-[0.62rem] font-medium uppercase tracking-widest text-accent">
            Outcome
          </dt>
          <dd className="mt-1 text-pretty font-sans text-caption leading-relaxed text-text">
            {project.impact}
          </dd>
        </dl>

        <details className="group/details border-y border-hairline py-space-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[0.65rem] uppercase tracking-widest text-muted transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
            Case study details
            <span
              aria-hidden="true"
              className="text-accent transition-transform group-open/details:rotate-45"
            >
              +
            </span>
          </summary>
          <dl className="flex flex-col gap-space-3 pb-space-2">
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-accent">
                Problem
              </dt>
              <dd className="mt-1 text-pretty text-caption leading-relaxed text-muted">
                {project.problem}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-accent">
                Solution
              </dt>
              <dd className="mt-1 text-pretty text-caption leading-relaxed text-muted">
                {project.solution}
              </dd>
            </div>
          </dl>
        </details>

        <div className="mt-auto flex flex-wrap items-center gap-space-4">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex min-h-11 items-center font-mono text-[0.65rem] font-medium uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            View case study →
          </Link>
          {showGithub || showLive ? (
            <>
              {showGithub ? (
                <ProjectLink
                  href={project.githubUrl as string}
                  projectId={project.id}
                  icon={<GitHubIcon />}
                >
                  GitHub
                </ProjectLink>
              ) : null}
              {showLive ? (
                <ProjectLink
                  href={project.liveUrl as string}
                  projectId={project.id}
                  icon={<ExternalLinkIcon />}
                >
                  Live Demo
                </ProjectLink>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
