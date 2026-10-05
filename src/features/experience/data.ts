import type { ExperienceView } from "@/types";
import { orderExperiences } from "./config";
import { PROFILE_EXPERIENCES } from "./profile-data";

/**
 * Fetch career-history entries for the public Experience timeline
 * (Requirement 5.1).
 *
 * Uses the verified, code-owned career profile instead of database rows so
 * stale demo data can never reappear publicly. The result is passed through
 * {@link orderExperiences} to preserve deterministic chronological ordering.
 */
export async function getExperiences(): Promise<ExperienceView[]> {
  return orderExperiences(PROFILE_EXPERIENCES);
}
