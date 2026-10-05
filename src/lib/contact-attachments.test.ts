import { describe, expect, it } from "vitest";

import {
  CONTACT_ATTACHMENT_MAX_BYTES,
  attachmentLabel,
  contactAttachmentPathname,
  isAllowedContactAttachment,
  isContactAttachmentUrl,
  isImageAttachment,
  mimeFromFileName,
  withContactAttachmentType,
} from "./contact-attachments";

describe("isAllowedContactAttachment", () => {
  it("accepts a PDF under the size limit", () => {
    const file = new File(["brief"], "brief.pdf", { type: "application/pdf" });
    expect(isAllowedContactAttachment(file)).toBe(true);
  });

  it("accepts a Word document by extension when the browser omits MIME type", () => {
    const file = new File(["doc"], "notes.docx");
    expect(isAllowedContactAttachment(withContactAttachmentType(file))).toBe(
      true,
    );
  });

  it("rejects an executable", () => {
    const file = new File(["x"], "payload.exe", {
      type: "application/octet-stream",
    });
    expect(isAllowedContactAttachment(file)).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const file = new File(
      [new Uint8Array(CONTACT_ATTACHMENT_MAX_BYTES + 1)],
      "huge.pdf",
      { type: "application/pdf" },
    );
    expect(isAllowedContactAttachment(file)).toBe(false);
  });
});

describe("isContactAttachmentUrl", () => {
  it("accepts HTTPS Vercel Blob URLs", () => {
    expect(
      isContactAttachmentUrl(
        "https://abc.blob.vercel-storage.com/contact-ideas/brief.pdf",
      ),
    ).toBe(true);
  });

  it("rejects non-Blob hosts", () => {
    expect(isContactAttachmentUrl("https://example.com/brief.pdf")).toBe(false);
  });

  it("rejects HTTP URLs", () => {
    expect(
      isContactAttachmentUrl(
        "http://abc.blob.vercel-storage.com/contact-ideas/brief.pdf",
      ),
    ).toBe(false);
  });
});

describe("attachment helpers", () => {
  it("maps common idea-file extensions to MIME types", () => {
    expect(mimeFromFileName("mockup.webp")).toBe("image/webp");
    expect(mimeFromFileName("notes.docx")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });

  it("builds a contact-ideas pathname", () => {
    expect(contactAttachmentPathname("My Brief (1).pdf", 0)).toMatch(
      /^contact-ideas\/\d+-0-My-Brief-1-\.pdf$/,
    );
  });

  it("labels a blob URL using the original file name", () => {
    expect(
      attachmentLabel(
        "https://abc.blob.vercel-storage.com/contact-ideas/1710000000-0-brief.pdf",
      ),
    ).toBe("brief.pdf");
  });

  it("detects image attachments from the file extension", () => {
    expect(
      isImageAttachment(
        "https://abc.blob.vercel-storage.com/contact-ideas/mockup.webp",
      ),
    ).toBe(true);
    expect(
      isImageAttachment(
        "https://abc.blob.vercel-storage.com/contact-ideas/brief.pdf",
      ),
    ).toBe(false);
  });
});
