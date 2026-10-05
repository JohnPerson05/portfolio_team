import prisma from "@/lib/prisma";
import { toTestimonialView, type TestimonialView } from "@/types";
import { orderTestimonials } from "./config";

/**
 * Fetch testimonials for the public Testimonials section (Requirement 6.1).
 *
 * Queries the shared Prisma client for every testimonial ordered by `order`
 * ascending and maps each row to the serializable {@link TestimonialView} DTO
 * so the section stays free of nullable Prisma types — the nullable
 * `company`/`avatarUrl`/`logoUrl` columns become optional, letting the card
 * render gracefully when they are absent (Requirement 6.2 / Requirement 17.2).
 * The result is passed through {@link orderTestimonials} as a defensive
 * re-sort, so the display-ordering invariant holds regardless of how the data
 * arrives.
 */
export async function getTestimonials(): Promise<TestimonialView[]> {
  const rows = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return orderTestimonials(rows.map(toTestimonialView));
}
