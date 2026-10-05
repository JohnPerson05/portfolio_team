import { describe, expect, it } from "vitest";

import { HONEYPOT_FIELD, contactSchema, parseContactFormData } from "./contact";

/**
 * contactSchema is the gate for persisting a ContactSubmission (Property 4,
 * Requirements 8.3, 8.6, 8.7). Tests cover valid, invalid, and boundary inputs.
 */

const validInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  message: "I would love to discuss an opportunity with your team.",
};

describe("contactSchema — valid input", () => {
  it("accepts a complete, well-formed submission", () => {
    const result = contactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a submission without a company (optional field)", () => {
    const { company: _company, ...rest } = validInput;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("normalizes an empty company string to undefined", () => {
    const result = contactSchema.safeParse({ ...validInput, company: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBeUndefined();
    }
  });

  it("trims surrounding whitespace from name", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      name: "  Ada Lovelace  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace");
    }
  });
});

describe("contactSchema — required fields", () => {
  it("rejects a missing name", () => {
    const { name: _name, ...rest } = validInput;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an empty/whitespace name", () => {
    expect(
      contactSchema.safeParse({ ...validInput, name: "   " }).success,
    ).toBe(false);
  });

  it("rejects a missing email", () => {
    const { email: _email, ...rest } = validInput;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a missing message", () => {
    const { message: _message, ...rest } = validInput;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });
});

describe("contactSchema — email format (Requirement 8.6)", () => {
  it.each(["not-an-email", "missing@tld", "@no-local.com", "spaces in@x.com"])(
    "rejects invalid email %s",
    (email) => {
      expect(
        contactSchema.safeParse({ ...validInput, email }).success,
      ).toBe(false);
    },
  );

  it("accepts a standard email address", () => {
    expect(
      contactSchema.safeParse({ ...validInput, email: "a.b+tag@sub.example.io" })
        .success,
    ).toBe(true);
  });
});

describe("contactSchema — message bounds", () => {
  it("rejects a message shorter than 10 characters", () => {
    expect(
      contactSchema.safeParse({ ...validInput, message: "too short" }).success,
    ).toBe(false);
  });

  it("rejects a message longer than 2000 characters", () => {
    expect(
      contactSchema.safeParse({ ...validInput, message: "a".repeat(2001) })
        .success,
    ).toBe(false);
  });

  it("accepts message at the lower boundary (10 chars)", () => {
    expect(
      contactSchema.safeParse({ ...validInput, message: "a".repeat(10) })
        .success,
    ).toBe(true);
  });

  it("accepts message at the upper boundary (2000 chars)", () => {
    expect(
      contactSchema.safeParse({ ...validInput, message: "a".repeat(2000) })
        .success,
    ).toBe(true);
  });
});

describe("contactSchema — name bounds", () => {
  it("accepts a name at the lower boundary (1 char)", () => {
    expect(
      contactSchema.safeParse({ ...validInput, name: "A" }).success,
    ).toBe(true);
  });

  it("accepts a name at the upper boundary (100 chars)", () => {
    expect(
      contactSchema.safeParse({ ...validInput, name: "a".repeat(100) }).success,
    ).toBe(true);
  });

  it("rejects a name longer than 100 chars", () => {
    expect(
      contactSchema.safeParse({ ...validInput, name: "a".repeat(101) }).success,
    ).toBe(false);
  });
});

describe("contactSchema — company bounds", () => {
  it("accepts company at the upper boundary (100 chars)", () => {
    expect(
      contactSchema.safeParse({ ...validInput, company: "a".repeat(100) })
        .success,
    ).toBe(true);
  });

  it("rejects company longer than 100 chars", () => {
    expect(
      contactSchema.safeParse({ ...validInput, company: "a".repeat(101) })
        .success,
    ).toBe(false);
  });
});

describe("contactSchema — honeypot (Requirement 8.7)", () => {
  it("passes when honeypot is undefined", () => {
    expect(contactSchema.safeParse(validInput).success).toBe(true);
  });

  it("passes when honeypot is an empty string", () => {
    expect(
      contactSchema.safeParse({ ...validInput, [HONEYPOT_FIELD]: "" }).success,
    ).toBe(true);
  });

  it("fails when honeypot is filled (bot signal)", () => {
    expect(
      contactSchema.safeParse({
        ...validInput,
        [HONEYPOT_FIELD]: "http://spam.example",
      }).success,
    ).toBe(false);
  });
});

describe("parseContactFormData", () => {
  function toFormData(record: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(record)) {
      fd.set(key, value);
    }
    return fd;
  }

  it("parses a valid FormData payload", () => {
    const result = parseContactFormData(toFormData(validInput));
    expect(result.success).toBe(true);
  });

  it("rejects a FormData payload with a filled honeypot", () => {
    const result = parseContactFormData(
      toFormData({ ...validInput, [HONEYPOT_FIELD]: "bot" }),
    );
    expect(result.success).toBe(false);
  });

  it("surfaces field errors for an invalid email", () => {
    const result = parseContactFormData(
      toFormData({ ...validInput, email: "nope" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("accepts Blob attachment URLs from FormData", () => {
    const fd = toFormData(validInput);
    fd.append(
      "attachmentUrls",
      "https://store.blob.vercel-storage.com/contact-ideas/mockup.webp",
    );
    const result = parseContactFormData(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.attachmentUrls).toEqual([
        "https://store.blob.vercel-storage.com/contact-ideas/mockup.webp",
      ]);
    }
  });

  it("rejects a non-Blob attachment URL", () => {
    const fd = toFormData(validInput);
    fd.append("attachmentUrls", "https://example.com/not-a-blob.pdf");
    expect(parseContactFormData(fd).success).toBe(false);
  });
});
