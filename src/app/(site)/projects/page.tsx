import type { Metadata } from "next";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, PageHero } from "@/components/ui";
import { getProjects, ProjectCard } from "@/features/projects";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "A growing archive of digital products, interactive websites, and engineered systems.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHero
        index="01"
        eyebrow="Selected work"
        title="Products engineered for real-world momentum."
        description="A growing collection of interactive applications, modern websites, and product systems—each shaped around a clear problem, considered execution, and measurable impact."
      />
      <section
        className="px-space-2 py-section sm:px-space-4"
        aria-label="Project archive"
      >
        <div className="mx-auto max-w-content">
          {projects.length > 0 ? (
            <Stagger as="ul" className="grid gap-space-4 md:grid-cols-2">
              {projects.map((project) => (
                <FadeUp as="li" key={project.id} className="h-full list-none">
                  <ProjectCard project={project} />
                </FadeUp>
              ))}
            </Stagger>
          ) : (
            <EmptyState
              title="Work archive coming soon"
              description="Finished products will appear here as they are published."
            />
          )}
        </div>
      </section>
    </>
  );
}
