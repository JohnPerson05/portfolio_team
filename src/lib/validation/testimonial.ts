import { z } from "zod";

import { optionalText, optionalUrl, orderSchema, requiredText } from "./shared";

/**
 * Testimonial validation (Requirement 6). Mirrors the Prisma `Testimonial`
 * model. `company`, `avatarUrl`, and `logoUrl` are optional; URLs are validated
 * only when present so a missing photo/logo never blocks persistence.
 */
export const testimonialSchema = z.object({
  quote: requiredText("Quote"),
  author: requiredText("Author").max(
    120,
    "Author must be 120 characters or fewer",
  ),
  role: requiredText("Role").max(120, "Role must be 120 characters or fewer"),
  company: optionalText(120, "Company"),
  avatarUrl: optionalUrl,
  logoUrl: optionalUrl,
  order: orderSchema,
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
