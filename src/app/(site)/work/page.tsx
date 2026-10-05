import type { Metadata } from "next";
import { EmptyState, PageHero } from "@/components/ui";
import { WorkShowcase } from "@/features/projects";
import { pageMetadata } from "@/lib/seo";
import { getPublishedProjects, getSectionCopy } from "@/server/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Selected Work",
    description:
      "Business problems, what was built to solve them, and what got better.",
    path: "/work",
  });
}

export default async function WorkPage() {
  const [projects, copy] = await Promise.all([
    getPublishedProjects(),
    getSectionCopy("work"),
  ]);

  return (
    <>
      <PageHero
        index="01"
        eyebrow={copy?.eyebrow ?? "Selected work"}
        title={copy?.title ?? "Real problems, solved."}
        description={
          copy?.description ??
          "Every story here starts with a business problem, explains what was built, and ends with what got better."
        }
        status={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
      />
      <section
        className="px-space-2 py-section sm:px-space-4"
        aria-label="Project archive"
      >
        <div className="mx-auto max-w-content">
          {projects.length > 0 ? (
            <WorkShowcase projects={projects} />
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
