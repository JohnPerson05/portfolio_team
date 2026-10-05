import { z } from "zod";

import { nonEmptyStringArray, orderSchema, requiredText } from "./shared";

/**
 * Experience validation (Requirement 5). Mirrors the Prisma `Experience`
 * model. `endDate` is nullable/optional — a `null`/absent value means the role
 * is current ("present"). When present, it must not predate `startDate`.
 */
export const experienceSchema = z
  .object({
    company: requiredText("Company").max(
      120,
      "Company must be 120 characters or fewer",
    ),
    position: requiredText("Position").max(
      120,
      "Position must be 120 characters or fewer",
    ),
    startDate: z.coerce.date({ invalid_type_error: "Start date is invalid" }),
    // null/undefined = present role.
    endDate: z.coerce
      .date({ invalid_type_error: "End date is invalid" })
      .nullable()
      .optional(),
    impact: requiredText("Impact"),
    achievements: nonEmptyStringArray,
    order: orderSchema,
  })
  .refine(
    (data) =>
      data.endDate === null ||
      data.endDate === undefined ||
      data.endDate >= data.startDate,
    {
      message: "End date cannot be before the start date",
      path: ["endDate"],
    },
  );

export type ExperienceInput = z.infer<typeof experienceSchema>;
