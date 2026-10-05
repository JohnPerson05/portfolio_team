import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
    this.name = "NotFoundError";
  }
}

vi.mock("next/navigation", () => ({
  __esModule: true,
  notFound: () => {
    throw new NotFoundError();
  },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/actions/contacts", () => ({
  __esModule: true,
  deleteContact: vi.fn(),
  markContactRead: vi.fn(),
}));

vi.mock("@/features/admin/contacts/data", () => ({
  __esModule: true,
  getContactSubmissionById: vi.fn(),
}));

import { markContactRead } from "@/actions/contacts";
import { getContactSubmissionById } from "@/features/admin/contacts/data";
import AdminContactDetailPage from "./page";

const mockedGetById = getContactSubmissionById as unknown as ReturnType<
  typeof vi.fn
>;
const mockedMarkRead = markContactRead as unknown as ReturnType<typeof vi.fn>;

function makeSubmission(read = false, attachmentUrls: string[] = []) {
  return {
    id: "inq_1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    message: "Here is the brief for the new platform.",
    submittedAt: "2025-02-20T09:15:00.000Z",
    attachmentUrls,
    read,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedMarkRead.mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AdminContactDetailPage", () => {
  it("renders the full message and attachments, and marks unread inquiries as read", async () => {
    mockedGetById.mockResolvedValueOnce(
      makeSubmission(false, [
        "https://example.blob.vercel-storage.com/contact-ideas/123-0-brief.pdf",
        "https://example.blob.vercel-storage.com/contact-ideas/123-1-mockup.webp",
      ]),
    );

    const ui = await AdminContactDetailPage({
      params: Promise.resolve({ id: "inq_1" }),
    });
    render(ui);

    expect(mockedMarkRead).toHaveBeenCalledWith("inq_1");
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(
      screen.getByText("Here is the brief for the new platform."),
    ).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /brief.pdf/i })).toHaveAttribute(
      "href",
      "https://example.blob.vercel-storage.com/contact-ideas/123-0-brief.pdf",
    );
    expect(screen.getByAltText("mockup.webp")).toHaveAttribute(
      "src",
      "https://example.blob.vercel-storage.com/contact-ideas/123-1-mockup.webp",
    );
  });

  it("does not mark an already-read inquiry again", async () => {
    mockedGetById.mockResolvedValueOnce(makeSubmission(true));

    const ui = await AdminContactDetailPage({
      params: Promise.resolve({ id: "inq_1" }),
    });
    render(ui);

    expect(mockedMarkRead).not.toHaveBeenCalled();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("404s when the inquiry does not exist", async () => {
    mockedGetById.mockResolvedValueOnce(null);

    await expect(
      AdminContactDetailPage({ params: Promise.resolve({ id: "missing" }) }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(mockedMarkRead).not.toHaveBeenCalled();
  });
});
