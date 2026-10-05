import Link from "next/link";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { hasLink } from "./config";
import { ProjectLink } from "./ProjectLink";
import { ProjectVisual } from "./ProjectVisual";

export interface ProjectCardProps {
  project: ProjectView;
  className?: string;
  /** Load the cover eagerly (first card above the fold). */
  priority?: boolean;
}

/** Minimal GitHub mark used for the source-code link (decorative). */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="presentation">
      <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22v3.29c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

/** Minimal "external link" glyph used for the live link (decorative). */
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
 * `ProjectCard` — one project told as a business story: the challenge, what
 * was built, and the result, with a deliberately quiet technology line.
 * Action links render only when their URL exists.
 */
export function ProjectCard({ project, className, priority = false }: ProjectCardProps) {
  const href = `/work/${project.slug}`;
  const showGithub = hasLink(project.githubUrl);
  const showLive = hasLink(project.projectUrl);
  const meta = [project.clientName, project.year?.toString()].filter(Boolean);

  return (
    <Card
      as="article"
      hover="lift"
      aria-labelledby={`project-${project.id}-title`}
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <ProjectVisual
        title={project.title}
        thumbnailUrl={project.coverImage}
        technologies={project.technologies.map((t) => t.name)}
        href={href}
        label={project.category ?? "Case study"}
        priority={priority}
      />

      <div className="flex flex-1 flex-col gap-space-3 p-space-3 sm:p-space-4">
        <div className="flex flex-col gap-space-1">
          {meta.length > 0 ? (
            <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
              {meta.join(" · ")}
            </p>
          ) : null}
          <h3
            id={`project-${project.id}-title`}
            className="text-balance font-display text-h3 font-semibold tracking-tight text-text"
          >
            <Link href={href} className="transition-colors hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <p className="text-pretty font-sans text-body text-muted">
            {project.tagline ?? project.shortDescription}
          </p>
        </div>

        <dl className="flex flex-col gap-space-2">
          {[
            { label: "The challenge", value: project.problem },
            { label: "What was built", value: project.solution },
          ].map((step) => (
            <div key={step.label} className="border-l border-white/15 pl-space-2">
              <dt className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                {step.label}
              </dt>
              <dd className="mt-0.5 line-clamp-3 text-pretty text-caption leading-relaxed text-text/80">
                {step.value}
              </dd>
            </div>
          ))}
          <div className="rounded-lg border border-accent/25 bg-accent/[0.06] p-space-2">
            <dt className="font-mono text-[0.62rem] font-medium uppercase tracking-widest text-accent">
              The result
            </dt>
            <dd className="mt-1 line-clamp-4 text-pretty font-sans text-body leading-relaxed text-text">
              {project.result}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-x-space-4">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center font-mono text-[0.65rem] font-medium uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            Read the full story →
          </Link>
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
              href={project.projectUrl as string}
              projectId={project.id}
              icon={<ExternalLinkIcon />}
            >
              Live site
            </ProjectLink>
          ) : null}
        </div>

        {project.technologies.length > 0 ? (
          <div className="border-t border-hairline pt-space-2">
            <p className="sr-only">Built with</p>
            <ul
              aria-label="Technologies"
              className="flex flex-wrap gap-x-space-2 gap-y-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted opacity-70"
            >
              {project.technologies.map((tech) => (
                <li key={tech.slug}>{tech.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
