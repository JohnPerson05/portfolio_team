import type { Metadata } from "next";

import { EmptyState, SectionHeading } from "@/components/ui";
import {
  CONTACTS_DESCRIPTION,
  CONTACTS_EMPTY_DESCRIPTION,
  CONTACTS_EMPTY_TITLE,
  CONTACTS_EYEBROW,
  CONTACTS_HEADING,
  ContactList,
  getContactSubmissions,
} from "@/features/admin/contacts";

export const metadata: Metadata = {
  title: "Contact submissions",
};

export const dynamic = "force-dynamic";

/**
 * `/admin/contacts` — inbox of contact form submissions (Requirement 12).
 *
 * Guarded by the `(protected)` layout. Each row links to a detail view that
 * shows the full message and attachments, marks the inquiry as read, and
 * allows deletion.
 */
export default async function AdminContactsPage() {
  const submissions = await getContactSubmissions();
  const headingId = "admin-contacts-heading";
  const unreadCount = submissions.filter((submission) => !submission.read)
    .length;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-space-6">
      <SectionHeading
        id={headingId}
        level={1}
        eyebrow={CONTACTS_EYEBROW}
        heading={CONTACTS_HEADING}
        description={
          unreadCount > 0
            ? `${CONTACTS_DESCRIPTION} ${unreadCount} unread.`
            : CONTACTS_DESCRIPTION
        }
      />

      {submissions.length > 0 ? (
        <ContactList submissions={submissions} />
      ) : (
        <EmptyState
          title={CONTACTS_EMPTY_TITLE}
          description={CONTACTS_EMPTY_DESCRIPTION}
        />
      )}
    </section>
  );
}
