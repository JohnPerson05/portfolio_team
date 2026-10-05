// Admin contacts feature barrel (Task 24): the most-recent-first data helper
// and the view's config/formatting/copy.

export { getContactSubmissions, getContactSubmissionById } from "./data";
export { ContactList } from "./ContactList";
export type { ContactListProps } from "./ContactList";
export { ContactDetail } from "./ContactDetail";
export type { ContactDetailProps } from "./ContactDetail";
export { ContactAttachments } from "./ContactAttachments";
export type { ContactAttachmentsProps } from "./ContactAttachments";
export { DeleteContactButton } from "./DeleteContactButton";
export type { DeleteContactButtonProps } from "./DeleteContactButton";
export {
  sortByRecency,
  formatSubmittedAt,
  previewMessage,
  filesLabel,
  adminContactHref,
  CONTACTS_EYEBROW,
  CONTACTS_HEADING,
  CONTACTS_DESCRIPTION,
  CONTACTS_EMPTY_TITLE,
  CONTACTS_EMPTY_DESCRIPTION,
  CONTACTS_NO_COMPANY,
  CONTACTS_NO_ATTACHMENTS,
  CONTACTS_UNREAD_LABEL,
  CONTACTS_READ_LABEL,
  CONTACTS_FILES_HEADING,
  CONTACTS_OPEN_LABEL,
  CONTACTS_BACK_LABEL,
  ADMIN_CONTACTS_HREF,
} from "./config";
