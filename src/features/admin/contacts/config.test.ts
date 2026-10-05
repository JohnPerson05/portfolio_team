import { describe, expect, it } from "vitest";

import type { ContactSubmissionView } from "@/types";
import { formatSubmittedAt, previewMessage, filesLabel, sortByRecency } from "./config";

function makeSubmission(
  id: string,
  submittedAt: string,
  overrides: Partial<ContactSubmissionView> = {},
): ContactSubmissionView {
  return {
    id,
    name: `Name ${id}`,
    email: `${id}@example.com`,
    company: undefined,
    message: `Message ${id}`,
    submittedAt,
    attachmentUrls: [],
    read: false,
    ...overrides,
  };
}

describe("sortByRecency — most-recent-first ordering (Property 10; Req 12.3)", () => {
  it("orders submissions newest-first by submittedAt", () => {
    const oldest = makeSubmission("oldest", "2024-01-01T08:00:00.000Z");
    const middle = makeSubmission("middle", "2024-06-15T12:30:00.000Z");
    const newest = makeSubmission("newest", "2025-02-20T09:15:00.000Z");

    const ordered = sortByRecency([middle, oldest, newest]);

    expect(ordered.map((s) => s.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      makeSubmission("a", "2024-01-01T00:00:00.000Z"),
      makeSubmission("b", "2025-01-01T00:00:00.000Z"),
    ];
    const snapshot = input.map((s) => s.id);

    sortByRecency(input);

    expect(input.map((s) => s.id)).toEqual(snapshot);
  });

  it("returns an empty array unchanged", () => {
    expect(sortByRecency([])).toEqual([]);
  });
});

describe("formatSubmittedAt — stable UTC timestamp", () => {
  it("formats an ISO timestamp as a human-readable UTC label", () => {
    expect(formatSubmittedAt("2025-01-20T16:05:00.000Z")).toBe(
      "Jan 20, 2025, 4:05 PM UTC",
    );
  });

  it("returns an empty string for an unparseable value", () => {
    expect(formatSubmittedAt("not-a-date")).toBe("");
  });
});

describe("previewMessage", () => {
  it("truncates long messages with an ellipsis", () => {
    const preview = previewMessage("a".repeat(200), 20);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(21);
  });

  it("returns a short message unchanged", () => {
    expect(previewMessage("Hello there")).toBe("Hello there");
  });
});

describe("filesLabel", () => {
  it("describes zero, one, and many files", () => {
    expect(filesLabel(0)).toBe("No files");
    expect(filesLabel(1)).toBe("1 file");
    expect(filesLabel(3)).toBe("3 files");
  });
});
