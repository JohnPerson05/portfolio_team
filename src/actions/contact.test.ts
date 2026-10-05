import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventType } from "@prisma/client";

// Mock the shared Prisma client so these tests never touch a real database.
// The factory must not reference outer-scope variables (vi.mock is hoisted).
vi.mock("@/lib/prisma", () => {
  const client = {
    contactSubmission: {
      create: vi.fn(),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

// Mock the analytics action so we can assert event recording without a DB.
vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  recordEvent: vi.fn(async () => undefined),
}));

// Mock next/headers so IP derivation is deterministic and SSR-context-free.
const mockHeadersGet = vi.fn<(name: string) => string | null>(() => null);
vi.mock("next/headers", () => ({
  __esModule: true,
  headers: vi.fn(async () => ({ get: mockHeadersGet }) as unknown as Headers),
}));

import prisma from "@/lib/prisma";
import { recordEvent } from "@/actions/analytics";
import { getClientIp } from "@/lib/client-ip";
import { __resetRateLimit } from "@/lib/rate-limit";
import { HONEYPOT_FIELD } from "@/lib/validation/contact";
import { submitContact } from "./contact";

const mockedPrisma = prisma as unknown as {
  contactSubmission: { create: ReturnType<typeof vi.fn> };
};
const mockedRecordEvent = recordEvent as unknown as ReturnType<typeof vi.fn>;

/** Build a FormData payload for the contact form with sensible defaults. */
function buildFormData(
  overrides: Partial<Record<string, string>> = {},
): FormData {
  const fields: Record<string, string> = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    message: "I would love to discuss an opportunity with your team.",
    [HONEYPOT_FIELD]: "",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Reset rate-limit state so each test starts from a clean window.
  __resetRateLimit();
  // Default: no forwarding headers -> falls back to "unknown".
  mockHeadersGet.mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("submitContact — validated persistence (Property 4; Req 8.2, 13.4)", () => {
  it("creates exactly one submission and records one CONTACT_SUBMISSION event for valid input", async () => {
    mockedPrisma.contactSubmission.create.mockResolvedValueOnce({
      id: "contact_1",
    });

    const result = await submitContact(buildFormData());

    expect(result).toEqual({ success: true });

    // Persisted exactly once with the validated fields.
    expect(mockedPrisma.contactSubmission.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        message: "I would love to discuss an opportunity with your team.",
        attachmentUrls: [],
      },
    });

    // Event recorded exactly once with the correct type (Property 5).
    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
    expect(mockedRecordEvent).toHaveBeenCalledWith({
      type: EventType.CONTACT_SUBMISSION,
      path: "/#contact",
    });
  });

  it("normalizes an empty company to undefined", async () => {
    mockedPrisma.contactSubmission.create.mockResolvedValueOnce({
      id: "contact_2",
    });

    const result = await submitContact(buildFormData({ company: "" }));

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: undefined,
        message: "I would love to discuss an opportunity with your team.",
        attachmentUrls: [],
      },
    });
  });

  it("persists Blob attachment URLs submitted with the inquiry", async () => {
    mockedPrisma.contactSubmission.create.mockResolvedValueOnce({
      id: "contact_3",
    });
    const attachmentUrl =
      "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf";
    const formData = buildFormData();
    formData.append("attachmentUrls", attachmentUrl);

    const result = await submitContact(formData);

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        message: "I would love to discuss an opportunity with your team.",
        attachmentUrls: [attachmentUrl],
      },
    });
  });
});

describe("submitContact — validation failures persist nothing (Req 8.3, 8.6; Property 4)", () => {
  it("returns fieldErrors for an invalid email and does not persist or record", async () => {
    const result = await submitContact(buildFormData({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
    expect(mockedPrisma.contactSubmission.create).not.toHaveBeenCalled();
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });

  it("returns fieldErrors for a missing name and does not persist", async () => {
    const result = await submitContact(buildFormData({ name: "" }));

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.name).toBeDefined();
    }
    expect(mockedPrisma.contactSubmission.create).not.toHaveBeenCalled();
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });

  it("returns fieldErrors for a too-short message and does not persist", async () => {
    const result = await submitContact(buildFormData({ message: "too short" }));

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.message).toBeDefined();
    }
    expect(mockedPrisma.contactSubmission.create).not.toHaveBeenCalled();
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });

  it("rejects a non-Blob attachment URL and does not persist", async () => {
    const formData = buildFormData();
    formData.append("attachmentUrls", "https://evil.example/payload.exe");

    const result = await submitContact(formData);

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.fieldErrors?.attachmentUrls).toBeDefined();
    }
    expect(mockedPrisma.contactSubmission.create).not.toHaveBeenCalled();
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });
});

describe("submitContact — honeypot anti-abuse (Req 8.7; Property 4)", () => {
  it("treats a filled honeypot as spam: soft success, no persistence, no event", async () => {
    const result = await submitContact(
      buildFormData({ [HONEYPOT_FIELD]: "http://spam.example" }),
    );

    // Documented choice: return soft success to avoid tipping off bots.
    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.create).not.toHaveBeenCalled();
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });
});

describe("submitContact — rate limiting (Req 8.7; Property 4)", () => {
  it("returns a form error once the per-IP limit is exceeded and persists nothing", async () => {
    mockHeadersGet.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "203.0.113.7" : null,
    );
    mockedPrisma.contactSubmission.create.mockResolvedValue({ id: "ok" });

    // Default limit is 5 requests per window; the 6th must be blocked.
    for (let i = 0; i < 5; i += 1) {
      const ok = await submitContact(buildFormData());
      expect(ok).toEqual({ success: true });
    }

    const blocked = await submitContact(buildFormData());
    expect(blocked).toEqual({
      success: false,
      formError: "Too many requests, please try again later.",
    });

    // Only the 5 allowed requests persisted; the blocked one did not.
    expect(mockedPrisma.contactSubmission.create).toHaveBeenCalledTimes(5);
  });
});

describe("submitContact — unexpected DB failure (Req 8.5)", () => {
  it("returns a form error and does not reject when create throws", async () => {
    mockedPrisma.contactSubmission.create.mockRejectedValueOnce(
      new Error("connection refused"),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await submitContact(buildFormData());

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.formError).toBeDefined();
    }
    // No event recorded when persistence failed.
    expect(mockedRecordEvent).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});

describe("getClientIp — IP derivation", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.5, 70.41.3.18, 150.172.238.178",
    });
    expect(getClientIp(headers)).toBe("198.51.100.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "192.0.2.44" });
    expect(getClientIp(headers)).toBe("192.0.2.44");
  });

  it("falls back to 'unknown' when no forwarding headers are present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
