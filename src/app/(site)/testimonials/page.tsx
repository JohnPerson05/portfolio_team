import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { Testimonials } from "@/features/testimonials";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Professional References",
  description:
    "Professional references for John Person Narral are available upon request.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        index="04"
        eyebrow="Professional references"
        title="Professional perspective, shared with context."
        description="A recommendation-style view of trusted working relationships. References are shared privately when relevant to a role, engagement, or project conversation."
      />
      <Testimonials
        eyebrow="Available on request"
        heading="Professional references"
        showDetailLink={false}
        className="bg-transparent"
      />
    </>
  );
}
