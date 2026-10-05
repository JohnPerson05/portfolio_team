import { describe, expect, it, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, ToastProvider, useToast } from "./Toast";

describe("Toast (presentational)", () => {
  it("renders the message", () => {
    render(<Toast variant="success" message="Saved!" />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("uses role=status with aria-live polite for success/info", () => {
    render(<Toast variant="success" message="Done" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Done");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("uses role=alert (assertive) for errors", () => {
    render(<Toast variant="error" message="Something failed" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something failed");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("renders a dismiss button with an accessible name when onDismiss is set", () => {
    render(<Toast variant="info" message="Hi" onDismiss={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Dismiss notification" }),
    ).toBeInTheDocument();
  });

  it("does not render a dismiss button without onDismiss", () => {
    render(<Toast variant="info" message="Hi" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("invokes onDismiss when the dismiss button is activated by keyboard", async () => {
    const onDismiss = vi.fn();
    render(
      <Toast
        variant="error"
        message="Oops"
        onDismiss={onDismiss}
        dismissLabel="Close"
      />,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

function ShowButton({
  duration,
}: {
  duration?: number | null;
}): React.JSX.Element {
  const { show } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        show({ variant: "success", message: "Submitted", duration })
      }
    >
      trigger
    </button>
  );
}

describe("ToastProvider + useToast", () => {
  it("show() makes a toast appear and the dismiss button removes it", async () => {
    render(
      <ToastProvider>
        <ShowButton duration={null} />
      </ToastProvider>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "trigger" }));
    expect(screen.getByText("Submitted")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.queryByText("Submitted")).not.toBeInTheDocument();
  });

  it("auto-dismisses a toast after its duration elapses", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <ToastProvider defaultDuration={3000}>
          <ShowButton />
        </ToastProvider>,
      );

      const trigger = container.querySelector("button");
      expect(trigger).not.toBeNull();
      act(() => {
        (trigger as HTMLButtonElement).click();
      });
      expect(screen.getByText("Submitted")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.queryByText("Submitted")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

afterEach(() => {
  vi.useRealTimers();
});
