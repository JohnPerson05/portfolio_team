import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { EventType } from "@prisma/client";

// Mock the analytics action so the tracker's record call is observable without
// touching a server action / database.
vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  recordEvent: vi.fn(async () => undefined),
}));

import { recordEvent } from "@/actions/analytics";
import { PageViewTracker } from "./PageViewTracker";

const mockedRecordEvent = recordEvent as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageViewTracker — page-view completeness (Property 5; Req 13.1)", () => {
  it("records exactly one PORTFOLIO_VIEW event on mount", () => {
    render(<PageViewTracker path="/" />);

    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
    expect(mockedRecordEvent).toHaveBeenCalledWith({
      type: EventType.PORTFOLIO_VIEW,
      path: "/",
    });
  });

  it("records the view without a path when none is provided", () => {
    render(<PageViewTracker />);

    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
    expect(mockedRecordEvent).toHaveBeenCalledWith({
      type: EventType.PORTFOLIO_VIEW,
      path: undefined,
    });
  });

  it("records only once even across re-renders (idempotent)", () => {
    const { rerender } = render(<PageViewTracker path="/" />);
    rerender(<PageViewTracker path="/" />);
    rerender(<PageViewTracker path="/" />);

    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
  });

  it("renders nothing into the document (adds no layout)", () => {
    const { container } = render(<PageViewTracker path="/" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("PageViewTracker — non-blocking analytics (Property 6; Req 13.7)", () => {
  it("does not throw to the visitor when recording rejects", () => {
    mockedRecordEvent.mockRejectedValueOnce(new Error("offline"));

    // Mounting must not throw even though recordEvent rejected.
    expect(() => render(<PageViewTracker path="/" />)).not.toThrow();
    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
  });
});
