import { Button } from "@/components/ui";
import type { ContactSubmissionView } from "@/types";
import { ContactAttachments } from "./ContactAttachments";
import {
  ADMIN_CONTACTS_HREF,
  CONTACTS_BACK_LABEL,
  CONTACTS_FILES_HEADING,
  CONTACTS_NO_COMPANY,
  CONTACTS_READ_LABEL,
  CONTACTS_UNREAD_LABEL,
  formatSubmittedAt,
} from "./config";
import { DeleteContactButton } from "./DeleteContactButton";

export interface ContactDetailProps {
  submission: ContactSubmissionView;
}

export function ContactDetail({ submission }: ContactDetailProps) {
  return (
    <article className="flex flex-col gap-space-6">
      <div className="flex flex-wrap items-start justify-between gap-space-3">
        <div className="flex flex-col gap-space-2">
          <Button href={ADMIN_CONTACTS_HREF} variant="ghost" size="sm">
            ← {CONTACTS_BACK_LABEL}
          </Button>
          <span
            className={
              submission.read
                ? "w-fit rounded-full bg-bg-secondary px-space-2 py-0.5 font-sans text-caption font-medium uppercase tracking-widest text-muted"
                : "w-fit rounded-full bg-accent/15 px-space-2 py-0.5 font-sans text-caption font-medium uppercase tracking-widest text-accent"
            }
          >
            {submission.read ? CONTACTS_READ_LABEL : CONTACTS_UNREAD_LABEL}
          </span>
        </div>
        <DeleteContactButton
          contactId={submission.id}
          contactName={submission.name}
        />
      </div>

      <header className="flex flex-col gap-space-2">
        <h1 className="font-display text-h2 font-semibold text-text">
          {submission.name}
        </h1>
        <p className="font-sans text-body text-muted">
          <a
            href={`mailto:${submission.email}`}
            className="rounded-sm text-muted underline-offset-2 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submission.email}
          </a>
          <span>
            {" · "}
            {submission.company ?? CONTACTS_NO_COMPANY}
          </span>
        </p>
        <time
          dateTime={submission.submittedAt}
          className="font-sans text-caption text-muted"
        >
          Received {formatSubmittedAt(submission.submittedAt)}
        </time>
      </header>

      <section className="rounded-lg border border-hairline bg-card p-space-4">
        <h2 className="mb-space-3 font-sans text-caption uppercase tracking-widest text-muted">
          Message
        </h2>
        <p className="whitespace-pre-wrap font-sans text-body text-pretty text-text">
          {submission.message}
        </p>
      </section>

      <section>
        <h2 className="mb-space-3 font-sans text-caption uppercase tracking-widest text-muted">
          {CONTACTS_FILES_HEADING}
        </h2>
        <ContactAttachments urls={submission.attachmentUrls} />
      </section>
    </article>
  );
}
