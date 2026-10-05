import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects, ProjectDetail } from "@/features/projects";
import { pageMetadata } from "@/lib/seo";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Prebuild every published case study; new ones render on first request. */
export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return pageMetadata({
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
    path: `/projects/${project.slug}`,
    image: project.ogImage ?? project.thumbnailUrl,
    type: "article",
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
