import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { Timeline } from "@/features/experience";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Experience",
    description:
      "A track record of building and improving products, platforms, and engineering teams.",
    path: "/experience",
  });
}

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Behind the studio · John's background"
        title="Where the engineering experience comes from."
        description="Approximately six years delivering banking, insurance, live-meeting, and enterprise web applications across Java, Spring Boot, microservices, React, modern frontend integration, and CI/CD."
      />
      <Timeline
        eyebrow="Career log"
        heading="From complex brief to shipped result"
        showDetailLink={false}
        className="bg-transparent"
      />
    </>
  );
}
