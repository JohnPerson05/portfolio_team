import type { Metadata } from "next";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, PageHero } from "@/components/ui";
import { getProjects, ProjectCard } from "@/features/projects";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "Business problems, what was built to solve them, and what got better.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHero
        index="01"
        eyebrow="Selected work"
        title="Real problems, solved."
        description="Every story here starts with a business problem, explains what was built, and ends with what got better. Much of it was delivered inside larger enterprise teams — the same standard we bring to every studio project."
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
