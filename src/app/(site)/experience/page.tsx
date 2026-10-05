import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { Timeline } from "@/features/experience";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Experience",
  description:
    "A track record of building and improving products, platforms, and engineering teams.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Experience"
        title="Enterprise backend depth with full-stack range."
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
