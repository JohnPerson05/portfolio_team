import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, PageHero, Tag } from "@/components/ui";
import type { ProjectView } from "@/types";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectLink } from "./ProjectLink";

/**
 * The original case-study page body. Shared by the public
 * `/projects/[slug]` route and the admin preview, so a preview shows exactly
 * what will be published.
 */
export function ProjectDetail({ project }: { project: ProjectView }) {
  return (
    <>
      <PageHero
        index={project.order.toString().padStart(2, "0")}
        eyebrow="Case study"
        title={project.title}
        description={project.summary}
        status="Enterprise delivery"
      />

      <article className="px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <FadeUp>
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
              <ProjectGallery
                title={project.title}
                imageUrls={project.imageUrls ?? []}
                technologies={project.technologies}
              />
            </div>
          </FadeUp>

          <Stagger className="mt-space-8 grid gap-space-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-space-4">
              <FadeUp>
                <section className="rounded-xl border border-hairline bg-card p-space-4 sm:p-space-5">
                  <span className="font-mono text-caption uppercase tracking-widest text-accent">
                    01 / Challenge
                  </span>
                  <h2 className="mt-space-2 font-display text-h2 font-semibold text-text">
                    The system context
                  </h2>
                  <p className="mt-space-3 text-pretty text-body-lg leading-relaxed text-muted">
                    {project.problem}
                  </p>
                </section>
              </FadeUp>

              <FadeUp>
                <section className="rounded-xl border border-hairline bg-card p-space-4 sm:p-space-5">
                  <span className="font-mono text-caption uppercase tracking-widest text-accent">
                    02 / Execution
                  </span>
                  <h2 className="mt-space-2 font-display text-h2 font-semibold text-text">
                    The engineering approach
                  </h2>
                  <p className="mt-space-3 text-pretty text-body-lg leading-relaxed text-muted">
                    {project.solution}
                  </p>
                </section>
              </FadeUp>

              <FadeUp>
                <section className="border-accent/20 bg-accent/[0.045] rounded-xl border p-space-4 sm:p-space-5">
                  <span className="font-mono text-caption uppercase tracking-widest text-accent">
                    03 / Outcome
                  </span>
                  <h2 className="mt-space-2 font-display text-h2 font-semibold text-text">
                    Practical impact
                  </h2>
                  <p className="mt-space-3 text-pretty text-body-lg leading-relaxed text-text">
                    {project.impact}
                  </p>
                </section>
              </FadeUp>
            </div>

            <FadeUp>
              <aside className="h-fit rounded-xl border border-hairline bg-card p-space-4 lg:sticky lg:top-24">
                <h2 className="font-mono text-caption uppercase tracking-widest text-muted">
                  Technology profile
                </h2>
                <ul className="mt-space-3 flex flex-wrap gap-space-1">
                  {project.technologies.map((technology) => (
                    <li key={technology}>
                      <Tag>{technology}</Tag>
                    </li>
                  ))}
                </ul>

                {project.githubUrl || project.liveUrl ? (
                  <div className="mt-space-4 flex flex-col border-t border-hairline pt-space-3">
                    {project.githubUrl ? (
                      <ProjectLink
                        href={project.githubUrl}
                        projectId={project.id}
                      >
                        View source
                      </ProjectLink>
                    ) : null}
                    {project.liveUrl ? (
                      <ProjectLink
                        href={project.liveUrl}
                        projectId={project.id}
                      >
                        Open live product
                      </ProjectLink>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-space-4 border-t border-hairline pt-space-3 text-caption leading-relaxed text-muted">
                    Client and enterprise work is presented without confidential
                    source code or private application links.
                  </p>
                )}

                <Button
                  href="/contact"
                  variant="primary"
                  size="md"
                  className="mt-space-4 w-full"
                >
                  Discuss a similar project
                </Button>
              </aside>
            </FadeUp>
          </Stagger>

          <div className="mt-space-10 flex flex-wrap items-center justify-between gap-space-3 border-t border-hairline pt-space-4">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              ← All projects
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
            >
              Start a project →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
