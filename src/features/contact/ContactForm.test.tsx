import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

// Mock the contact Server Action so the form's persist path is observable
// without a database. The factory must not reference outer-scope variables.
vi.mock("@/actions/contact", () => ({
  __esModule: true,
  submitContact: vi.fn(),
}));

vi.mock("@vercel/blob/client", () => ({
  upload: vi.fn(),
}));

import { ToastProvider } from "@/components/ui";
import { submitContact } from "@/actions/contact";
import { upload } from "@vercel/blob/client";
import { HONEYPOT_FIELD } from "@/lib/validation/contact";
import { ContactForm } from "./ContactForm";
import { CONTACT_SUCCESS_MESSAGE } from "./config";

const mockedSubmitContact = submitContact as unknown as ReturnType<
  typeof vi.fn
>;
const mockedUpload = upload as unknown as ReturnType<typeof vi.fn>;

/** Render the form inside the ToastProvider it depends on. */
function renderForm(ui: ReactElement = <ContactForm />) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

/** Valid values that satisfy contactSchema (message >= 10 chars). */
const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  message: "I would love to discuss an opportunity with your team.",
};

/** Fill the visible fields with the provided (defaulted) values. */
async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<typeof VALID> = {},
) {
  const data = { ...VALID, ...overrides };
  if (data.name) await user.type(screen.getByLabelText(/name/i), data.name);
  if (data.email) await user.type(screen.getByLabelText(/email/i), data.email);
  if (data.company)
    await user.type(screen.getByLabelText(/company/i), data.company);
  if (data.message)
    await user.type(screen.getByLabelText(/message/i), data.message);
}

function submitButton() {
  return screen.getByRole("button", { name: /send message/i });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContactForm — accessible structure (Req 8.1)", () => {
  it("renders a labelled contact section with Name/Email/Company/Message fields", () => {
    renderForm();
    expect(
      screen.getByRole("region", { name: /build something exceptional/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project files/i)).toBeInTheDocument();
  });
});

describe("ContactForm — invalid submit (Req 8.3; Property 4 at the form layer)", () => {
  it("surfaces field-level errors and does NOT call the persist path for invalid input", async () => {
    const user = userEvent.setup();
    renderForm();

    // Submit with everything empty: required fields must fail validation.
    await user.click(submitButton());

    // Inline field errors are shown (associated to controls via Field).
    const nameField = screen.getByLabelText(/name/i);
    const emailField = screen.getByLabelText(/email/i);
    const messageField = screen.getByLabelText(/message/i);
    expect(nameField).toHaveAttribute("aria-invalid", "true");
    expect(emailField).toHaveAttribute("aria-invalid", "true");
    expect(messageField).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Crucially, client-side validation prevents the server/persist call.
    expect(mockedSubmitContact).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format without calling the persist path", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { email: "not-an-email" });
    await user.click(submitButton());

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(mockedSubmitContact).not.toHaveBeenCalled();
  });

  it("does not proceed to the success/reset path when the action returns fieldErrors", async () => {
    // Even if a call were to occur, a fieldErrors response must not reset.
    mockedSubmitContact.mockResolvedValueOnce({
      success: false,
      fieldErrors: { email: ["Enter a valid email address"] },
    });
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
    });

    // Field error surfaced and entered data preserved (no reset).
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/name/i)).toHaveValue(VALID.name);
    expect(screen.queryByText(CONTACT_SUCCESS_MESSAGE)).not.toBeInTheDocument();
  });
});

describe("ContactForm — successful submit (Req 8.2, 8.4)", () => {
  it("calls submitContact with the entered data and an empty honeypot", async () => {
    mockedSubmitContact.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
    });
    const [formData] = mockedSubmitContact.mock.calls[0] as [FormData];
    expect(formData.get("name")).toBe(VALID.name);
    expect(formData.get("email")).toBe(VALID.email);
    expect(formData.get("company")).toBe(VALID.company);
    expect(formData.get("message")).toBe(VALID.message);
    expect(formData.get(HONEYPOT_FIELD)).toBe("");
    expect(formData.getAll("attachmentUrls")).toEqual([]);
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("shows a success confirmation and resets the form on success", async () => {
    mockedSubmitContact.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(submitButton());

    // Confirmation appears (the inline status; a toast is also shown).
    await waitFor(() => {
      expect(
        screen.getAllByText(CONTACT_SUCCESS_MESSAGE).length,
      ).toBeGreaterThan(0);
    });

    // Form reset: every visible field is cleared.
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/company/i)).toHaveValue("");
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });

  it("uploads selected idea files and submits their public URLs", async () => {
    mockedUpload.mockResolvedValueOnce({
      url: "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf",
    });
    mockedSubmitContact.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    const file = new File(["idea brief"], "brief.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText(/project files/i), file);
    expect(screen.getByText("brief.pdf")).toBeInTheDocument();

    await user.click(submitButton());

    await waitFor(() => {
      expect(mockedUpload).toHaveBeenCalledTimes(1);
      expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
    });

    const [pathname, uploadedFile] = mockedUpload.mock.calls[0] as [
      string,
      File,
    ];
    expect(pathname).toMatch(/^contact-ideas\//);
    expect(uploadedFile.name).toBe("brief.pdf");

    const [formData] = mockedSubmitContact.mock.calls[0] as [FormData];
    expect(formData.getAll("attachmentUrls")).toEqual([
      "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf",
    ]);
  });
});

describe("ContactForm — server failure preserves data (Req 8.5)", () => {
  it("shows the form error and preserves the entered input on a server formError", async () => {
    mockedSubmitContact.mockResolvedValueOnce({
      success: false,
      formError: "Too many requests, please try again later.",
    });
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
    });

    // Error message is surfaced (inline alert and/or toast).
    await waitFor(() => {
      expect(screen.getAllByText(/too many requests/i).length).toBeGreaterThan(
        0,
      );
    });

    // Entered data is preserved (NOT cleared) so the visitor can retry.
    expect(screen.getByLabelText(/name/i)).toHaveValue(VALID.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(VALID.email);
    expect(screen.getByLabelText(/company/i)).toHaveValue(VALID.company);
    expect(screen.getByLabelText(/message/i)).toHaveValue(VALID.message);

    // No success confirmation rendered.
    expect(screen.queryByText(CONTACT_SUCCESS_MESSAGE)).not.toBeInTheDocument();
  });

  it("preserves input and shows a generic error when the action rejects", async () => {
    mockedSubmitContact.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
    });

    // An alert is shown and the data is retained.
    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/message/i)).toHaveValue(VALID.message);
  });
});

describe("ContactForm — honeypot is hidden from humans (Req 8.7)", () => {
  it("renders the honeypot out of the tab order inside an aria-hidden container", () => {
    const { container } = renderForm();

    // The honeypot input exists (it is submitted) but is taken out of the tab
    // order and wrapped in an aria-hidden container so humans / assistive tech
    // never interact with it.
    const honeypot = container.querySelector(`input[name="${HONEYPOT_FIELD}"]`);
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("excludes the honeypot from the accessible textbox fields", () => {
    renderForm();
    // The visible, labelled textboxes are exactly Name/Email/Company/Message —
    // the honeypot is not exposed as an accessible field.
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes).toHaveLength(4);
  });
});
