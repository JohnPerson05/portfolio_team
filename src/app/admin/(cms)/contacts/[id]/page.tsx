import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { markContactRead } from "@/actions/contacts";
import {
  ContactDetail,
  getContactSubmissionById,
} from "@/features/admin/contacts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inquiry",
};

/**
 * `/admin/contacts/[id]` — full inquiry, attachments, and delete.
 * Opening this page marks the inquiry as read.
 */
export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getContactSubmissionById(id);

  if (!submission) {
    notFound();
  }

  if (!submission.read) {
    await markContactRead(id);
  }

  return <ContactDetail submission={{ ...submission, read: true }} />;
}
