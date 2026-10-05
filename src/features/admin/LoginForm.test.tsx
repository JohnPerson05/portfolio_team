import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Integration tests for the admin login form (Requirement 9.2, 9.3; Property 8).
 *
 * The `login` Server Action is mocked so we exercise the form's branching:
 *  - invalid credentials → action returns a generic `formError`; the form shows
 *    a single generic error and performs NO navigation (no session granted).
 *  - valid credentials → action returns `{ success: true }`; the form navigates
 *    to the dashboard.
 *
 * `next/navigation` useRouter is mocked to capture navigation.
 */

const replaceMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/actions/auth", () => ({
  __esModule: true,
  login: vi.fn(),
}));

import { login } from "@/actions/auth";
import { LoginForm } from "./LoginForm";
import { ADMIN_DASHBOARD_HREF, LOGIN_GENERIC_ERROR } from "./config";

const mockedLogin = login as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LoginForm — renders accessible fields (Req 9.2)", () => {
  it("renders email and password fields and a submit control", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });
});

describe("LoginForm — invalid credentials surface a generic error (Req 9.3; Property 8)", () => {
  it("shows the generic error and does NOT navigate when login fails", async () => {
    const user = userEvent.setup();
    mockedLogin.mockResolvedValueOnce({
      success: false,
      formError: LOGIN_GENERIC_ERROR,
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(LOGIN_GENERIC_ERROR);

    // No session granted → no navigation to the dashboard (Property 8).
    expect(replaceMock).not.toHaveBeenCalled();
    expect(mockedLogin).toHaveBeenCalledTimes(1);
  });
});

describe("LoginForm — successful login navigates to the dashboard (Req 9.2)", () => {
  it("navigates to /admin when the action returns success", async () => {
    const user = userEvent.setup();
    mockedLogin.mockResolvedValueOnce({ success: true });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(ADMIN_DASHBOARD_HREF);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
