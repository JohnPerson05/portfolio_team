import { cn } from "@/lib/utils";
import type { ContactSubmissionView } from "@/types";
import {
  adminContactHref,
  CONTACTS_OPEN_LABEL,
  CONTACTS_READ_LABEL,
  CONTACTS_UNREAD_LABEL,
  filesLabel,
  formatSubmittedAt,
  previewMessage,
} from "./config";
import { DeleteContactButton } from "./DeleteContactButton";

export interface ContactListProps {
  submissions: readonly ContactSubmissionView[];
}

/**
 * Inbox list: each inquiry is a row the owner can open. Unread items are
 * labelled until the detail view is visited. Attachments are summarized here
 * and shown in full on the detail page.
 */
export function ContactList({ submissions }: ContactListProps) {
  return (
    <ul className="flex flex-col gap-space-3">
      {submissions.map((submission) => (
        <li
          key={submission.id}
          className={cn(
            "rounded-lg border border-hairline bg-card p-space-4",
            !submission.read && "border-accent/40",
          )}
        >
          <div className="flex flex-col gap-space-3 sm:flex-row sm:items-start sm:justify-between">
            <a
              href={adminContactHref(submission.id)}
              className="min-w-0 flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex flex-wrap items-center gap-space-2">
                <span
                  className={cn(
                    "rounded-full px-space-2 py-0.5 font-sans text-caption font-medium uppercase tracking-widest",
                    submission.read
                      ? "bg-bg-secondary text-muted"
                      : "bg-accent/15 text-accent",
                  )}
                >
                  {submission.read
                    ? CONTACTS_READ_LABEL
                    : CONTACTS_UNREAD_LABEL}
                </span>
                <span className="font-sans text-caption text-muted">
                  {filesLabel(submission.attachmentUrls.length)}
                </span>
              </div>
              <h2
                className={cn(
                  "mt-space-2 font-display text-h3 text-text",
                  !submission.read && "font-semibold",
                )}
              >
                {submission.name}
              </h2>
              <p className="mt-space-1 font-sans text-caption text-muted">
                {submission.email}
                {submission.company ? ` · ${submission.company}` : ""}
              </p>
              <p className="mt-space-2 font-sans text-body text-text">
                {previewMessage(submission.message)}
              </p>
              <time
                dateTime={submission.submittedAt}
                className="mt-space-2 block font-sans text-caption text-muted"
              >
                {formatSubmittedAt(submission.submittedAt)}
              </time>
              <span className="mt-space-2 inline-block font-sans text-caption text-accent">
                {CONTACTS_OPEN_LABEL}
              </span>
            </a>
            <div className="shrink-0">
              <DeleteContactButton
                contactId={submission.id}
                contactName={submission.name}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
