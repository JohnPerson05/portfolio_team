import { SkillCategory } from "@prisma/client";
import { z } from "zod";

import { orderSchema, requiredText } from "./shared";

/**
 * Skill validation (Requirement 4). `proficiency` is validated to the 0–100
 * range; `category` reuses Prisma's generated `SkillCategory` enum via
 * `z.nativeEnum` so the four domains stay in sync with the database.
 */
export const skillSchema = z.object({
  name: requiredText("Name").max(60, "Name must be 60 characters or fewer"),
  category: z.nativeEnum(SkillCategory),
  proficiency: z
    .number({ invalid_type_error: "Proficiency must be a number" })
    .int("Proficiency must be an integer")
    .min(0, "Proficiency must be 0 or greater")
    .max(100, "Proficiency must be 100 or less"),
  order: orderSchema,
});

export type SkillInput = z.infer<typeof skillSchema>;
