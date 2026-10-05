import { z } from "zod";

import {
  nonEmptyStringArray,
  optionalUrl,
  orderSchema,
  requiredText,
  slugSchema,
} from "./shared";

const projectImageUrl = z
  .string()
  .trim()
  .min(1, "Image URL cannot be empty")
  .refine(
    (value) => {
      if (value.startsWith("/")) return !value.startsWith("//");
      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Use a valid image URL or a path beginning with /" },
  );

/**
 * Project validation (Requirement 10.4; Property 4). Mirrors the Prisma
 * `Project` model's create/update fields with bounds and URL validation so the
 * admin CMS can never persist a malformed project.
 */
export const projectSchema = z.object({
  title: requiredText("Title").max(
    120,
    "Title must be 120 characters or fewer",
  ),
  slug: slugSchema,
  summary: requiredText("Summary"),
  problem: requiredText("Problem"),
  solution: requiredText("Solution"),
  impact: requiredText("Impact"),
  technologies: nonEmptyStringArray.min(1, "Add at least one technology"),
  imageUrls: z
    .array(projectImageUrl)
    .max(12, "Add no more than 12 project images")
    .default([]),
  /** Backward-compatible input accepted by existing callers and tests. */
  thumbnailUrl: optionalUrl,
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  featured: z.boolean().default(false),
  order: orderSchema,
});

export type ProjectInput = z.infer<typeof projectSchema>;
