import prisma from "@/lib/prisma";

export interface ActivityEntry {
  /** Dotted verb, e.g. "project.publish". */
  action: string;
  entityType: string;
  entityId?: string | null;
  /** Human-readable line shown in /admin/activity. */
  summary: string;
}

/**
 * Append to the activity log. Never throws — a logging failure must not undo
 * or block the change the admin just made.
 */
export async function logActivity(
  actor: { id: string } | null,
  entry: ActivityEntry,
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: actor?.id ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        summary: entry.summary.slice(0, 300),
      },
    });
  } catch (error) {
    console.error("Failed to write activity log", error);
  }
}
