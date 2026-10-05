import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { ContactForm } from "@/features/contact";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Start a Project",
  description:
    "Discuss an interactive product, website, platform, or engineering engagement.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        index="06"
        eyebrow="Start a project"
        title="Bring the ambitious brief."
        description="Share the goal, current constraints, and what success should look like. Attach a brief, mockup, or sketch if you have one — PDF, Word, or images are welcome."
        status="Accepting new conversations"
      />
      <ContactForm
        eyebrow="Project intake"
        heading="Tell me what you are building"
        description="Apps, interactive websites, product platforms, and selective engineering partnerships. Attach PDFs, Word docs, or images of your idea if that helps."
      />
    </>
  );
}
