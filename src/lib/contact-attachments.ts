/** Shared rules for contact-form idea attachments. */

export const CONTACT_ATTACHMENT_MAX_FILES = 5;
export const CONTACT_ATTACHMENT_MAX_BYTES = 8 * 1024 * 1024;
export const CONTACT_ATTACHMENT_PREFIX = "contact-ideas/";
export const CONTACT_ATTACHMENT_HANDLE_URL = "/api/contact/attachments";

export const CONTACT_ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.avif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,image/gif,image/avif";

export const CONTACT_ATTACHMENT_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const EXTENSION_TO_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export function mimeFromFileName(name: string): string | undefined {
  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? EXTENSION_TO_TYPE[extension] : undefined;
}

export function withContactAttachmentType(file: File): File {
  if (file.type) return file;
  const type = mimeFromFileName(file.name);
  return type ? new File([file], file.name, { type, lastModified: file.lastModified }) : file;
}

export function isAllowedContactAttachment(file: File): boolean {
  if (file.size <= 0 || file.size > CONTACT_ATTACHMENT_MAX_BYTES) return false;
  const type = file.type || mimeFromFileName(file.name);
  return (
    typeof type === "string" &&
    (CONTACT_ATTACHMENT_CONTENT_TYPES as readonly string[]).includes(type)
  );
}

export function isContactAttachmentUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function attachmentLabel(url: string): string {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const last = pathname.split("/").filter(Boolean).pop() ?? "attachment";
    return last.replace(/^\d+-\d+-/, "");
  } catch {
    return "attachment";
  }
}

export function contactAttachmentPathname(fileName: string, index: number): string {
  const safe =
    fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "idea";
  return `${CONTACT_ATTACHMENT_PREFIX}${Date.now()}-${index}-${safe}`;
}

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif)$/i;

export function isImageAttachment(url: string): boolean {
  try {
    return IMAGE_EXTENSION.test(new URL(url).pathname);
  } catch {
    return IMAGE_EXTENSION.test(url);
  }
}
