import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventType } from "@prisma/client";

// Mock the analytics action so we can assert event recording without a DB.
vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  recordEvent: vi.fn(async () => undefined),
}));

import { recordEvent } from "@/actions/analytics";
import { ProjectLink } from "./ProjectLink";

const mockedRecordEvent = recordEvent as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProjectLink — project click tracking (Property 5; Req 3.5, 13.2)", () => {
  it("records exactly one PROJECT_CLICK event with the correct projectId on click", async () => {
    const user = userEvent.setup();
    render(
      <ProjectLink href="https://github.com/example/p1" projectId="proj-1">
        GitHub
      </ProjectLink>,
    );

    // Prevent jsdom "navigation not implemented" noise from the anchor.
    const link = screen.getByRole("link", { name: /github/i });
    link.addEventListener("click", (e) => e.preventDefault());

    await user.click(link);

    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
    expect(mockedRecordEvent).toHaveBeenCalledWith({
      type: EventType.PROJECT_CLICK,
      projectId: "proj-1",
      path: "https://github.com/example/p1",
    });
  });

  it("opens the link in a new tab with safe rel attributes (Req 3.5)", () => {
    render(
      <ProjectLink href="https://p1.example.com" projectId="proj-1">
        Live Demo
      </ProjectLink>,
    );

    const link = screen.getByRole("link", { name: /live demo/i });
    expect(link).toHaveAttribute("href", "https://p1.example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not throw to the visitor when analytics recording rejects (Property 6)", async () => {
    mockedRecordEvent.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();

    render(
      <ProjectLink href="https://p2.example.com" projectId="proj-2">
        Live Demo
      </ProjectLink>,
    );
    const link = screen.getByRole("link", { name: /live demo/i });
    link.addEventListener("click", (e) => e.preventDefault());

    // The click handler must not reject/throw even though recordEvent rejected.
    await expect(user.click(link)).resolves.toBeUndefined();
    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
  });
});
