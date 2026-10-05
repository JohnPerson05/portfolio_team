import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { Testimonials } from "@/features/testimonials";
import { pageMetadata } from "@/lib/seo";
import { getSectionCopy, getTestimonials } from "@/server/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Testimonials",
    description: "What clients and collaborators say about working with the studio.",
    path: "/testimonials",
  });
}

export default async function TestimonialsPage() {
  const [testimonials, copy] = await Promise.all([
    getTestimonials(),
    getSectionCopy("testimonials"),
  ]);

  return (
    <>
      <PageHero
        index="04"
        eyebrow={copy?.eyebrow ?? "Testimonials"}
        title={copy?.title ?? "What people say about working with us"}
        description={
          copy?.description ??
          "Feedback from the people we've built for and worked alongside. References are also available on request."
        }
      />
      <Testimonials
        testimonials={testimonials}
        eyebrow="In their words"
        heading="Testimonials"
        showDetailLink={false}
        className="bg-transparent"
      />
    </>
  );
}
