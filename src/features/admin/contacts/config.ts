/**
 * Admin contacts view configuration + formatting (Task 24, Requirement 12).
 *
 * Requirement 12.1: the contacts view lists every submission with name, email,
 * company, message, and timestamp. Requirement 12.3 / Correctness Property 10:
 * submissions are ordered most-recent-first. The recency ordering is enforced
 * at the data layer (`data.ts`, `orderBy createdAt desc`) and re-asserted by the
 * pure {@link sortByRecency} helper here so the invariant holds regardless of
 * how the rows arrive and is testable in isolation.
 *
 * The timestamp formatting is a view-layer concern kept here (mirroring the
 * blog/experience `config.ts` split) so the Server Component stays declarative.
 */

import type { ContactSubmissionView } from "@/types";

/** Eyebrow label shown above the contacts heading. */
export const CONTACTS_EYEBROW = "Inbox" as const;
/** Contacts view heading. */
export const CONTACTS_HEADING = "Contact submissions" as const;
/** Supporting copy beneath the heading. */
export const CONTACTS_DESCRIPTION =
  "Open an inquiry to read the full message and attachments. New messages stay unread until you view them." as const;

/** Empty-state copy shown when there are no submissions (Requirement 12.2). */
export const CONTACTS_EMPTY_TITLE = "No submissions yet" as const;
export const CONTACTS_EMPTY_DESCRIPTION =
  "Messages from the contact form will appear here as they arrive." as const;

/** Fallback rendered for a submission with no company (optional field). */
export const CONTACTS_NO_COMPANY = "—" as const;
/** Fallback rendered when a submission has no attached files. */
export const CONTACTS_NO_ATTACHMENTS = "No files attached." as const;
/** Status labels for the inbox list and detail view. */
export const CONTACTS_UNREAD_LABEL = "Unread" as const;
export const CONTACTS_READ_LABEL = "Read" as const;
/** Inbox list / detail navigation. */
export const ADMIN_CONTACTS_HREF = "/admin/contacts" as const;
export function adminContactHref(id: string): string {
  return `${ADMIN_CONTACTS_HREF}/${id}`;
}

export const CONTACTS_OPEN_LABEL = "View inquiry" as const;
export const CONTACTS_BACK_LABEL = "Back to inbox" as const;
export const CONTACTS_FILES_HEADING = "Attachments" as const;

export const CONTACT_DELETE_LABEL = "Delete" as const;
export const CONTACT_DELETE_TITLE = "Delete this inquiry?" as const;
export const CONTACT_DELETE_DESCRIPTION =
  "This removes the message and its attachment links from the inbox. Uploaded files are not recoverable from here." as const;
export const CONTACT_DELETE_CONFIRM = "Delete inquiry" as const;
export const CONTACT_DELETE_CANCEL = "Cancel" as const;
export const CONTACT_DELETING_LABEL = "Deleting…" as const;
export const CONTACT_GENERIC_ERROR =
  "Something went wrong. Please try again." as const;

const MESSAGE_PREVIEW_MAX = 140;

/**
 * Collapse whitespace and truncate a message for the inbox list.
 */
export function previewMessage(
  message: string,
  max = MESSAGE_PREVIEW_MAX,
): string {
  const compact = message.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}…`;
}

export function filesLabel(count: number): string {
  if (count <= 0) return "No files";
  return count === 1 ? "1 file" : `${count} files`;
}

/**
 * Order submissions most-recent-first by `submittedAt` (Correctness Property 10
 * / Requirement 12.3).
 *
 * ISO-8601 timestamps compare correctly as strings, so a descending
 * `localeCompare` yields newest → oldest. Pure and non-mutating: the input
 * array is copied first. Defensive — the live query already orders by
 * `createdAt desc`, but re-sorting here keeps the invariant if a caller passes
 * an unordered list and makes the guarantee unit-testable.
 */
export function sortByRecency(
  submissions: readonly ContactSubmissionView[],
): ContactSubmissionView[] {
  return [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
}

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  // Pin to UTC so the rendered timestamp is stable regardless of the
  // server/client timezone.
  timeZone: "UTC",
});

/**
 * Format an ISO-8601 timestamp as a human-readable submission time
 * (e.g. "Jan 20, 2025, 4:05 PM UTC"). Returns an empty string for an
 * unparseable value so a bad row never throws.
 */
export function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${TIMESTAMP_FORMATTER.format(date)} UTC`;
}
