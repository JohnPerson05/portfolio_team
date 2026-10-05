import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * CMS login form. The `login` Server Action and the router are mocked so we
 * exercise the form's branching: generic errors with no navigation, success
 * navigation (including a safe return path), and remember me.
 */

const replaceMock = vi.fn();
const refreshMock = vi.fn();
let nextParam: string | null = null;
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(nextParam ? { next: nextParam } : {}),
}));

vi.mock("@/actions/auth", () => ({ __esModule: true, login: vi.fn() }));

import { login } from "@/actions/auth";
import { LoginForm, safeNext } from "./LoginForm";
import { ADMIN_DASHBOARD_HREF, LOGIN_GENERIC_ERROR } from "./config";

const mockedLogin = login as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  nextParam = null;
});

async function fillAndSubmit(email = "owner@example.com", password = "a-long-password-123") {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  return user;
}

describe("LoginForm", () => {
  it("renders labelled fields, remember me, and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeChecked();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows the generic error and does not navigate when login fails", async () => {
    mockedLogin.mockResolvedValueOnce({ success: false, formError: LOGIN_GENERIC_ERROR });
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(LOGIN_GENERIC_ERROR);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("navigates to the dashboard on success and sends remember me", async () => {
    mockedLogin.mockResolvedValueOnce({ success: true });
    await fillAndSubmit();
    expect(replaceMock).toHaveBeenCalledWith(ADMIN_DASHBOARD_HREF);
    const sent = mockedLogin.mock.calls[0]?.[0] as FormData;
    expect(sent.get("remember")).toBe("on");
  });

  it("returns to the requested CMS page after sign-in", async () => {
    nextParam = "/admin/projects";
    mockedLogin.mockResolvedValueOnce({ success: true });
    await fillAndSubmit();
    expect(replaceMock).toHaveBeenCalledWith("/admin/projects");
  });

  it("validates presence before calling the server", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/enter your email/i);
    expect(mockedLogin).not.toHaveBeenCalled();
  });
});

describe("safeNext", () => {
  it("only allows CMS paths", () => {
    expect(safeNext("/admin/team")).toBe("/admin/team");
    expect(safeNext("https://evil.example")).toBe(ADMIN_DASHBOARD_HREF);
    expect(safeNext("//evil.example")).toBe(ADMIN_DASHBOARD_HREF);
    expect(safeNext("/work")).toBe(ADMIN_DASHBOARD_HREF);
    expect(safeNext("/admin/login")).toBe(ADMIN_DASHBOARD_HREF);
    expect(safeNext(null)).toBe(ADMIN_DASHBOARD_HREF);
  });
});
