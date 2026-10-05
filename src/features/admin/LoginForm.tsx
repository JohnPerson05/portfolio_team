"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, Input, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { login } from "@/actions/auth";
import {
  ADMIN_DASHBOARD_HREF,
  LOGIN_DESCRIPTION,
  LOGIN_EMAIL_LABEL,
  LOGIN_EYEBROW,
  LOGIN_GENERIC_ERROR,
  LOGIN_HEADING,
  LOGIN_PASSWORD_LABEL,
  LOGIN_SUBMIT_LABEL,
  LOGIN_SUBMITTING_LABEL,
} from "./config";

/** The visible fields of the login form. */
interface LoginValues {
  email: string;
  password: string;
}

const EMPTY_VALUES: LoginValues = { email: "", password: "" };

export interface LoginFormProps {
  className?: string;
}

/**
 * `LoginForm` — the owner sign-in form (Requirement 9.2, 9.3).
 *
 * A client component with Email + Password fields that calls the {@link login}
 * Server Action. On success the action sets the session cookie and this form
 * navigates to the dashboard (Requirement 9.2). On failure the action returns a
 * single GENERIC `formError` — identical for unknown email and wrong password —
 * which is surfaced as a form-level alert so the UI never enables user
 * enumeration (Requirement 9.3). A failed login establishes no session
 * (Property 8), which the action guarantees.
 *
 * Accessibility (Req 15.2): wired through {@link Field} (`<label>` +
 * `aria-invalid`/`aria-describedby`); the form-level error is announced via a
 * `role="alert"` live region. `noValidate` defers validation messaging to the
 * action for consistency.
 */
export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const headingId = useId();
  const statusId = useId();

  const [values, setValues] = useState<LoginValues>(EMPTY_VALUES);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (formError) setFormError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    setSubmitting(true);
    try {
      const result = await login(formData);

      if (result.success) {
        // Session established (Req 9.2). Navigate to the dashboard; refresh so
        // the now-authenticated server render is picked up.
        router.replace(ADMIN_DASHBOARD_HREF);
        router.refresh();
        return;
      }

      // Generic credentials error (Req 9.3) — no enumeration.
      setFormError(result.formError ?? LOGIN_GENERIC_ERROR);
      setSubmitting(false);
    } catch {
      setFormError(LOGIN_GENERIC_ERROR);
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-space-8 px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <SectionHeading
        id={headingId}
        level={1}
        eyebrow={LOGIN_EYEBROW}
        heading={LOGIN_HEADING}
        description={LOGIN_DESCRIPTION}
      />

      <form
        noValidate
        aria-describedby={statusId}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-space-4"
      >
        <Field label={LOGIN_EMAIL_LABEL} required>
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label={LOGIN_PASSWORD_LABEL} required>
          {(control) => (
            <Input
              {...control}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
            />
          )}
        </Field>

        {/* Form-level error live region (Req 9.3). */}
        <div id={statusId} className="min-h-[1.5rem]">
          {formError ? (
            <p
              role="alert"
              className="font-sans text-body font-medium text-red-400"
            >
              {formError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? LOGIN_SUBMITTING_LABEL : LOGIN_SUBMIT_LABEL}
        </Button>
      </form>
    </section>
  );
}
