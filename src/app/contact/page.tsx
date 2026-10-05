import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { ContactForm } from "@/features/contact";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Start a Project",
  description:
    "Tell us about your idea or the problem slowing your business down. No technical brief needed.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        index="06"
        eyebrow="Start a project"
        title="Tell us what you're trying to build."
        description="No technical brief needed. Tell us what's slowing your business down or the idea you want to test — both of us read every message. Attach notes, a sketch, or a screenshot if it helps."
        status="Accepting new conversations"
      />
      <ContactForm
        eyebrow="Project intake"
        heading="Tell me what you are building"
        description="New products, internal tools, customer portals, secure access, or ongoing support. Attach PDFs, Word docs, or images of your idea if that helps."
      />
    </>
  );
}
