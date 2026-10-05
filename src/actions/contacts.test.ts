import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class RedirectError extends Error {
  constructor() {
    super("NEXT_REDIRECT");
    this.name = "RedirectError";
  }
}

vi.mock("@/lib/prisma", () => {
  const client = {
    contactSubmission: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { __esModule: true, default: client, prisma: client };
});

vi.mock("@/lib/auth", () => ({
  __esModule: true,
  requireSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  __esModule: true,
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { deleteContact, markContactRead } from "./contacts";

const mockedPrisma = prisma as unknown as {
  contactSubmission: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};
const mockedRequireSession = requireSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockedRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedRequireSession.mockResolvedValue({
    sub: "owner@example.com",
    iat: 1,
    exp: 2,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("markContactRead", () => {
  it("rejects and writes nothing when unauthenticated", async () => {
    mockedRequireSession.mockImplementationOnce(async () => {
      throw new RedirectError();
    });

    await expect(markContactRead("inq_1")).rejects.toBeInstanceOf(RedirectError);
    expect(mockedPrisma.contactSubmission.update).not.toHaveBeenCalled();
  });

  it("sets readAt for an unread inquiry and revalidates the inbox", async () => {
    mockedPrisma.contactSubmission.findUnique.mockResolvedValueOnce({
      id: "inq_1",
      readAt: null,
    });
    mockedPrisma.contactSubmission.update.mockResolvedValueOnce({ id: "inq_1" });

    const result = await markContactRead("inq_1");

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.update).toHaveBeenCalledWith({
      where: { id: "inq_1" },
      data: { readAt: expect.any(Date) },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/contacts");
  });

  it("does not rewrite an inquiry that is already read", async () => {
    mockedPrisma.contactSubmission.findUnique.mockResolvedValueOnce({
      id: "inq_1",
      readAt: new Date("2025-02-20T10:00:00.000Z"),
    });

    const result = await markContactRead("inq_1");

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.update).not.toHaveBeenCalled();
  });
});

describe("deleteContact", () => {
  it("rejects and writes nothing when unauthenticated", async () => {
    mockedRequireSession.mockImplementationOnce(async () => {
      throw new RedirectError();
    });

    await expect(deleteContact("inq_1")).rejects.toBeInstanceOf(RedirectError);
    expect(mockedPrisma.contactSubmission.delete).not.toHaveBeenCalled();
  });

  it("deletes the inquiry and revalidates the inbox", async () => {
    mockedPrisma.contactSubmission.delete.mockResolvedValueOnce({ id: "inq_1" });

    const result = await deleteContact("inq_1");

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.contactSubmission.delete).toHaveBeenCalledWith({
      where: { id: "inq_1" },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/admin/contacts");
  });

  it("returns a form error for a missing id", async () => {
    const result = await deleteContact("   ");
    expect(result.success).toBe(false);
    expect(mockedPrisma.contactSubmission.delete).not.toHaveBeenCalled();
  });
});
