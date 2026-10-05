import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { MagneticButton } from "./MagneticButton";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("MagneticButton", () => {
  it("renders an accessible button that forwards children and props", () => {
    mockMatchMedia(false);
    render(
      <MagneticButton type="submit" aria-label="Send message">
        Send
      </MagneticButton>,
    );
    const button = screen.getByRole("button", { name: "Send message" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("remains keyboard operable and fires onClick", async () => {
    mockMatchMedia(false);
    const onClick = vi.fn();
    render(<MagneticButton onClick={onClick}>Press</MagneticButton>);

    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Press" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards a ref to the underlying button element", () => {
    mockMatchMedia(false);
    const ref = createRef<HTMLButtonElement>();
    render(<MagneticButton ref={ref}>Ref</MagneticButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("stays a static, functional button under reduced motion", async () => {
    mockMatchMedia(reducedMotionMatcher);
    const onClick = vi.fn();
    render(<MagneticButton onClick={onClick}>Static</MagneticButton>);
    const button = screen.getByRole("button", { name: "Static" });
    // No inline transform applied (no magnetic motion).
    expect(button.style.transform ?? "").toBe("");
    const user = userEvent.setup();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
