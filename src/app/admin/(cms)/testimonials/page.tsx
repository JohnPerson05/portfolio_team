import type { Metadata } from "next";
import { Suspense } from "react";

import { listProjectOptions, listTestimonials } from "@/server/admin/queries";
import { TestimonialsManager } from "@/features/admin/content/TestimonialsManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const [testimonials, projects] = await Promise.all([listTestimonials(), listProjectOptions()]);
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Real feedback from clients and collaborators. Only published testimonials appear on the site."
      />
      <Suspense>
        <TestimonialsManager testimonials={testimonials} projects={projects} />
      </Suspense>
    </>
  );
}
