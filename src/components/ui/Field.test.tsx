import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./Field";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

describe("Field", () => {
  it("associates the label with the control via htmlFor/id", () => {
    render(
      <Field label="Full name">
        {(control) => <Input name="name" {...control} />}
      </Field>,
    );
    // getByLabelText only succeeds when the label is correctly associated.
    const control = screen.getByLabelText("Full name");
    expect(control).toBeInTheDocument();
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("name", "name");
  });

  it("uses a provided id for the label/control association", () => {
    render(
      <Field id="email-field" label="Email">
        {(control) => <Input type="email" {...control} />}
      </Field>,
    );
    const control = screen.getByLabelText("Email");
    expect(control).toHaveAttribute("id", "email-field");
    expect(screen.getByText("Email").closest("label")).toHaveAttribute(
      "for",
      "email-field",
    );
  });

  it("marks the control invalid and links the exact error text via aria-describedby when an error is present", () => {
    render(
      <Field id="msg" label="Message" error="Message is required">
        {(control) => <Textarea {...control} />}
      </Field>,
    );

    const control = screen.getByLabelText("Message");
    // aria-invalid must be the string "true".
    expect(control).toHaveAttribute("aria-invalid", "true");

    // Assert the wiring explicitly: the described-by id must reference the
    // element that contains the exact error message.
    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorId = (describedBy ?? "")
      .split(" ")
      .find((token) => token.endsWith("-error"));
    expect(errorId).toBeTruthy();

    const errorEl = document.getElementById(errorId as string);
    expect(errorEl).not.toBeNull();
    expect(errorEl).toHaveTextContent("Message is required");
    // The error is announced.
    expect(errorEl).toHaveAttribute("role", "alert");
  });

  it("does not mark the control invalid when there is no error", () => {
    render(
      <Field id="name" label="Name">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const control = screen.getByLabelText("Name");
    // aria-invalid must be absent or "false", never "true".
    expect(control.getAttribute("aria-invalid")).not.toBe("true");
    // No error element should be rendered/linked.
    const describedBy = control.getAttribute("aria-describedby") ?? "";
    expect(describedBy).not.toMatch(/-error\b/);
  });

  it("references the description/hint via aria-describedby", () => {
    render(
      <Field
        id="company"
        label="Company"
        description="Where you currently work"
      >
        {(control) => <Input {...control} />}
      </Field>,
    );

    const control = screen.getByLabelText("Company");
    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descriptionId = (describedBy ?? "")
      .split(" ")
      .find((token) => token.endsWith("-description"));
    expect(descriptionId).toBeTruthy();

    const descriptionEl = document.getElementById(descriptionId as string);
    expect(descriptionEl).toHaveTextContent("Where you currently work");
  });

  it("references both description and error ids when both are present", () => {
    render(
      <Field
        id="bio"
        label="Bio"
        description="A short summary"
        error="Too long"
      >
        {(control) => <Textarea {...control} />}
      </Field>,
    );
    const control = screen.getByLabelText("Bio");
    const describedBy = control.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("bio-description");
    expect(describedBy).toContain("bio-error");
  });

  it("renders the control as required and shows a required marker", () => {
    render(
      <Field id="name" label="Name" required>
        {(control) => <Input {...control} />}
      </Field>,
    );
    // The label also contains an aria-hidden "*" required marker, so match the
    // label by id rather than an exact text query.
    const control = document.getElementById("name");
    expect(control).toBeRequired();
    // The visible required marker is present and hidden from assistive tech.
    const marker = screen.getByText("*");
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });
});
