import { PostStatus } from "@prisma/client";
import { z } from "zod";

import { optionalUrl, requiredText, slugSchema } from "./shared";

/**
 * Blog post validation (Requirement 11; Property 3 is enforced downstream via
 * `status`). Reuses Prisma's generated `PostStatus` enum through
 * `z.nativeEnum` so the validation layer stays in sync with the schema.
 */
export const postSchema = z.object({
  title: requiredText("Title").max(160, "Title must be 160 characters or fewer"),
  slug: slugSchema,
  excerpt: requiredText("Excerpt").max(
    300,
    "Excerpt must be 300 characters or fewer",
  ),
  content: requiredText("Content"),
  coverUrl: optionalUrl,
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  // Nullable + optional: drafts have no publish date; published posts may carry one.
  publishedAt: z.coerce.date().nullable().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
