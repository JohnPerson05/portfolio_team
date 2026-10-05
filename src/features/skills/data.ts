import prisma from "@/lib/prisma";
import { toSkillView, type SkillView } from "@/types";

/**
 * Fetch all skills for the public Skills section (Requirement 4.1).
 *
 * Queries the shared Prisma client for every skill ordered by `category` then
 * `order` ascending, and maps each row to the serializable {@link SkillView}
 * DTO so the section (and its client bar islands) stay free of Prisma row types
 * (Requirement 17.2). Grouping into the four {@link SkillCategory} buckets is
 * handled by {@link groupSkills} in the section itself, so this stays a thin,
 * single-responsibility query.
 */
export async function getSkills(): Promise<SkillView[]> {
  const rows = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  return rows.map(toSkillView);
}
