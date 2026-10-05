import {
  attachmentLabel,
  isImageAttachment,
} from "@/lib/contact-attachments";
import { CONTACTS_NO_ATTACHMENTS } from "./config";

export interface ContactAttachmentsProps {
  urls: readonly string[];
}

/**
 * Admin gallery for inquiry files: image previews plus open links for
 * documents (PDF, Word).
 */
export function ContactAttachments({ urls }: ContactAttachmentsProps) {
  if (urls.length === 0) {
    return (
      <p className="font-sans text-body text-muted">{CONTACTS_NO_ATTACHMENTS}</p>
    );
  }

  return (
    <ul className="grid gap-space-3 sm:grid-cols-2">
      {urls.map((url) => {
        const label = attachmentLabel(url);
        const image = isImageAttachment(url);

        return (
          <li
            key={url}
            className="overflow-hidden rounded-lg border border-hairline bg-bg-secondary"
          >
            {image ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {/* Blob URLs are arbitrary hosts; a native img avoids next/image remote config. */}
                <img
                  src={url}
                  alt={label}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="block truncate px-space-3 py-space-2 font-sans text-caption text-text">
                  {label}
                </span>
              </a>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-24 flex-col justify-center gap-space-1 px-space-3 py-space-3 font-sans text-body text-text underline-offset-2 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="text-caption uppercase tracking-widest text-muted">
                  File
                </span>
                <span className="break-all font-medium">{label}</span>
                <span className="text-caption text-accent">Open attachment</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
