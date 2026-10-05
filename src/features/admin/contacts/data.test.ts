import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the shared Prisma client so these tests never touch a real database.
// The factory must not reference outer-scope variables (vi.mock is hoisted), so
// the mock functions are created inline and retrieved via the imported module.
vi.mock("@/lib/prisma", () => {
  const client = {
    contactSubmission: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

import prisma from "@/lib/prisma";
import { getContactSubmissionById, getContactSubmissions } from "./data";

const mockedPrisma = prisma as unknown as {
  contactSubmission: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
};

/** Build a Prisma-shaped ContactSubmission row (with Date/nullable fields). */
function makeRow(
  id: string,
  createdAt: Date,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    name: `Name ${id}`,
    email: `${id}@example.com`,
    company: null,
    message: `Message ${id}`,
    attachmentUrls: [],
    createdAt,
    readAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getContactSubmissions — recency ordering (Property 10; Req 12.3)", () => {
  it("queries every submission ordered by createdAt descending", async () => {
    mockedPrisma.contactSubmission.findMany.mockResolvedValueOnce([]);

    await getContactSubmissions();

    expect(mockedPrisma.contactSubmission.findMany).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.contactSubmission.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns submissions newest-first (defensive re-sort) as serializable DTOs", async () => {
    // Intentionally return rows out of order to prove the helper re-sorts.
    mockedPrisma.contactSubmission.findMany.mockResolvedValueOnce([
      makeRow("middle", new Date("2024-06-15T12:30:00.000Z")),
      makeRow("newest", new Date("2025-02-20T09:15:00.000Z"), {
        company: "Acme Corp",
      }),
      makeRow("oldest", new Date("2024-01-01T08:00:00.000Z")),
    ]);

    const submissions = await getContactSubmissions();

    expect(submissions.map((s) => s.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);

    const [first] = submissions;
    // Dates are serialized to ISO strings; nullable company normalized.
    expect(first?.submittedAt).toBe("2025-02-20T09:15:00.000Z");
    expect(first?.company).toBe("Acme Corp");
    expect(first).not.toHaveProperty("createdAt");
  });

  it("maps a null company to undefined", async () => {
    mockedPrisma.contactSubmission.findMany.mockResolvedValueOnce([
      makeRow("solo", new Date("2024-01-01T00:00:00.000Z")),
    ]);

    const [submission] = await getContactSubmissions();

    expect(submission?.company).toBeUndefined();
  });

  it("returns an empty array when there are no submissions (Req 12.2)", async () => {
    mockedPrisma.contactSubmission.findMany.mockResolvedValueOnce([]);

    await expect(getContactSubmissions()).resolves.toEqual([]);
  });
});

describe("getContactSubmissionById", () => {
  it("returns a serializable DTO for a matching row", async () => {
    mockedPrisma.contactSubmission.findUnique.mockResolvedValueOnce(
      makeRow("solo", new Date("2025-02-20T09:15:00.000Z"), {
        attachmentUrls: [
          "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf",
        ],
      }),
    );

    const submission = await getContactSubmissionById("solo");

    expect(mockedPrisma.contactSubmission.findUnique).toHaveBeenCalledWith({
      where: { id: "solo" },
    });
    expect(submission?.id).toBe("solo");
    expect(submission?.attachmentUrls).toHaveLength(1);
    expect(submission?.read).toBe(false);
  });

  it("returns null when the id is missing or empty", async () => {
    await expect(getContactSubmissionById("")).resolves.toBeNull();
    expect(mockedPrisma.contactSubmission.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when no row exists", async () => {
    mockedPrisma.contactSubmission.findUnique.mockResolvedValueOnce(null);
    await expect(getContactSubmissionById("missing")).resolves.toBeNull();
  });
});
