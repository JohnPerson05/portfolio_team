import Image from "next/image";
import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, PageHero, Tag } from "@/components/ui";
import { imageSource } from "@/lib/images";
import type { ProjectView, TestimonialView } from "@/types";
import { hasLink } from "./config";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectLink } from "./ProjectLink";

export interface ProjectCaseStudyProps {
  project: ProjectView;
  /** Index shown in the hero (e.g. "03"). */
  index: string;
  next?: ProjectView;
  testimonials?: readonly TestimonialView[];
  /**
   * In admin preview, links that would leave the preview (other projects,
   * analytics tracking) are rendered inert.
   */
  preview?: boolean;
}

function StoryBlock({
  step,
  heading,
  body,
  highlight = false,
}: {
  step: string;
  heading: string;
  body: string;
  highlight?: boolean;
}) {
  if (!body.trim()) return null;
  return (
    <FadeUp>
      <section
        className={
          highlight
            ? "rounded-xl border border-accent/20 bg-accent/[0.045] p-space-4 sm:p-space-5"
            : "rounded-xl border border-hairline bg-card p-space-4 sm:p-space-5"
        }
      >
        <span className="font-mono text-caption uppercase tracking-widest text-accent">
          {step}
        </span>
        <h2 className="mt-space-2 font-display text-h2 font-semibold text-text">
          {heading}
        </h2>
        <p
          className={`mt-space-3 whitespace-pre-line text-pretty text-body-lg leading-relaxed ${highlight ? "text-text" : "text-muted"}`}
        >
          {body}
        </p>
      </section>
    </FadeUp>
  );
}

/**
 * The full case-study page body. Shared by the public `/work/[slug]` route
 * and the admin preview, so a preview is exactly what will be published.
 */
export function ProjectCaseStudy({
  project,
  index,
  next,
  testimonials = [],
  preview = false,
}: ProjectCaseStudyProps) {
  const meta = [project.category, project.clientName, project.year?.toString()].filter(
    (value): value is string => Boolean(value),
  );
  const links = [
    hasLink(project.projectUrl) ? { href: project.projectUrl, label: "Open live product" } : null,
    hasLink(project.githubUrl) ? { href: project.githubUrl, label: "View source" } : null,
    hasLink(project.otherUrl)
      ? { href: project.otherUrl, label: project.otherUrlLabel ?? "More" }
      : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  const showHeroImage =
    !!project.heroImage &&
    project.heroImage !== project.media[0]?.url &&
    project.media.length > 0;

  return (
    <>
      <PageHero
        index={index}
        eyebrow={project.category ?? "Case study"}
        title={project.title}
        description={project.tagline ?? project.shortDescription}
        status={meta.length > 0 ? meta.join(" · ") : "Case study"}
      />

      <article className="px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          {showHeroImage ? (
            <FadeUp>
              <div className="relative mb-space-6 aspect-[21/9] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
                <Image
                  {...imageSource(project.heroImage as string)}
                  alt={`${project.title} hero`}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            </FadeUp>
          ) : null}

          <FadeUp>
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
              <ProjectGallery
                title={project.title}
                media={
                  project.media.length > 0
                    ? project.media
                    : project.heroImage
                      ? [{ id: "hero", mediaType: "IMAGE", url: project.heroImage }]
                      : []
                }
                technologies={project.technologies.map((t) => t.name)}
              />
            </div>
          </FadeUp>

          {project.tagline && project.shortDescription ? (
            <FadeUp>
              <p className="mx-auto mt-space-8 max-w-3xl text-pretty text-center font-display text-h3 leading-snug text-text/90">
                {project.shortDescription}
              </p>
            </FadeUp>
          ) : null}

          <Stagger className="mt-space-8 grid gap-space-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-space-4">
              {project.description ? (
                <FadeUp>
                  <div className="whitespace-pre-line text-pretty text-body-lg leading-relaxed text-muted">
                    {project.description}
                  </div>
                </FadeUp>
              ) : null}
              <StoryBlock step="01 / Challenge" heading="What was getting in the way" body={project.problem} />
              <StoryBlock step="02 / What was built" heading="How we solved it" body={project.solution} />
              <StoryBlock step="03 / The result" heading="What got better" body={project.result} highlight />

              {testimonials.map((testimonial) => (
                <FadeUp key={testimonial.id}>
                  <figure className="rounded-xl border border-hairline bg-card p-space-4 sm:p-space-5">
                    <blockquote className="border-l-2 border-accent/40 pl-space-3 text-pretty text-body-lg leading-relaxed text-text">
                      <p>&ldquo;{testimonial.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="mt-space-3 text-caption text-muted">
                      <span className="font-semibold text-text">{testimonial.author}</span>
                      {" — "}
                      {testimonial.company ? `${testimonial.role}, ${testimonial.company}` : testimonial.role}
                    </figcaption>
                  </figure>
                </FadeUp>
              ))}
            </div>

            <FadeUp>
              <aside className="h-fit rounded-xl border border-hairline bg-card p-space-4 lg:sticky lg:top-24">
                {meta.length > 0 ? (
                  <dl className="mb-space-4 grid grid-cols-2 gap-space-2 border-b border-hairline pb-space-4">
                    {project.category ? (
                      <div>
                        <dt className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">Type</dt>
                        <dd className="mt-1 text-body text-text">{project.category}</dd>
                      </div>
                    ) : null}
                    {project.clientName ? (
                      <div>
                        <dt className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">Client</dt>
                        <dd className="mt-1 text-body text-text">{project.clientName}</dd>
                      </div>
                    ) : null}
                    {project.year ? (
                      <div>
                        <dt className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">Year</dt>
                        <dd className="mt-1 text-body text-text">{project.year}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}

                {project.technologies.length > 0 ? (
                  <>
                    <h2 className="font-mono text-caption uppercase tracking-widest text-muted">Built with</h2>
                    <ul className="mt-space-3 flex flex-wrap gap-space-1">
                      {project.technologies.map((technology) => (
                        <li key={technology.slug}>
                          <Tag>{technology.name}</Tag>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {links.length > 0 ? (
                  <div className="mt-space-4 flex flex-col border-t border-hairline pt-space-3">
                    {links.map((link) =>
                      preview ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center text-body font-medium text-muted hover:text-accent"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <ProjectLink key={link.href} href={link.href} projectId={project.id}>
                          {link.label}
                        </ProjectLink>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-space-4 border-t border-hairline pt-space-3 text-caption leading-relaxed text-muted">
                    Client and enterprise work is presented without confidential source code or private application links.
                  </p>
                )}

                <Button href="/contact" variant="primary" size="md" className="mt-space-4 w-full">
                  Discuss a similar project
                </Button>
              </aside>
            </FadeUp>
          </Stagger>

          {next && next.id !== project.id ? (
            <FadeUp>
              <Link
                href={preview ? "#" : `/work/${next.slug}`}
                aria-disabled={preview || undefined}
                className="group mt-space-10 flex flex-col gap-space-3 overflow-hidden rounded-2xl border border-hairline bg-card p-space-4 transition-colors hover:border-accent/40 sm:flex-row sm:items-center sm:p-space-5"
              >
                {next.coverImage ? (
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
                    <Image
                      {...imageSource(next.coverImage)}
                      alt=""
                      fill
                      sizes="14rem"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="font-mono text-caption uppercase tracking-widest text-accent">Next project →</p>
                  <p className="mt-space-1 font-display text-h3 font-semibold text-text">{next.title}</p>
                  <p className="mt-space-1 line-clamp-2 text-body text-muted">{next.tagline ?? next.shortDescription}</p>
                </div>
              </Link>
            </FadeUp>
          ) : null}

          <div className="mt-space-8 flex flex-wrap items-center justify-between gap-space-3 border-t border-hairline pt-space-4">
            <Link
              href={preview ? "#" : "/work"}
              className="inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              ← All work
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
