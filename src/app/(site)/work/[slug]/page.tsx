import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/features/projects";
import { pageMetadata, projectJsonLd, serializeJsonLd } from "@/lib/seo";
import {
  getAdjacentProjects,
  getPublishedProjectBySlug,
  getPublishedProjects,
  getSiteSettings,
  getTestimonials,
} from "@/server/public/queries";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Prebuild every published case study; new ones render on first request. */
export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  return pageMetadata({
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.shortDescription,
    path: `/work/${project.slug}`,
    image: project.ogImage ?? project.coverImage,
    type: "article",
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const [{ next }, all, testimonials, settings] = await Promise.all([
    getAdjacentProjects(slug),
    getPublishedProjects(),
    getTestimonials(),
    getSiteSettings(),
  ]);
  const position = all.findIndex((p) => p.id === project.id) + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(projectJsonLd(project, settings["studio.name"])),
        }}
      />
      <ProjectCaseStudy
        project={project}
        index={String(Math.max(position, 1)).padStart(2, "0")}
        next={next}
        testimonials={testimonials.filter((t) => t.project?.slug === project.slug)}
      />
    </>
  );
}
