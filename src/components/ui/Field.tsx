import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The accessibility props {@link Field} injects into its control. Spread these
 * onto an {@link Input}, {@link Textarea}, or any custom control:
 *
 * ```tsx
 * <Field label="Email" required error={errors.email}>
 *   {(control) => <Input type="email" name="email" {...control} />}
 * </Field>
 * ```
 *
 * - `id` matches the rendered `<label htmlFor>` (label↔control association).
 * - `aria-invalid` is `true` only while an `error` is present.
 * - `aria-describedby` references the hint and/or error element ids (or is
 *   `undefined` when neither exists), so assistive tech announces them.
 * - `required` mirrors the field's required flag.
 */
export interface FieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
  required: boolean;
}

export interface FieldProps {
  /** Visible label text; rendered in a real `<label>` tied to the control. */
  label: ReactNode;
  /**
   * Render the control, receiving the wiring props to spread onto it. Using a
   * function keeps the control fully typed and lets the same `Field` wrap an
   * `Input`, a `Textarea`, or a custom control.
   */
  children: (control: FieldControlProps) => ReactNode;
  /** Field-level validation error. When set, the control is marked invalid. */
  error?: string;
  /** Optional supporting hint shown beneath the label. */
  description?: ReactNode;
  /** Marks the field required (native `required` + visible marker). */
  required?: boolean;
  /**
   * Control id. When omitted a stable id is generated with React `useId` so the
   * label, control, hint, and error stay linked across renders.
   */
  id?: string;
  className?: string;
}

/**
 * `Field` — the accessible wrapper that ties a `<label>`, an optional
 * hint/description, an optional error message, and a form control together.
 *
 * Wiring (Req 8.3, 15.2):
 * - Renders a real `<label htmlFor={id}>` associated with the control.
 * - When `error` is present, the control gets `aria-invalid="true"` and the
 *   error element (`id={`${id}-error`}`) is referenced via `aria-describedby`
 *   and announced via `role="alert"`.
 * - When `description` is present, the hint element (`id={`${id}-description`}`)
 *   is referenced via `aria-describedby`; both ids are included when present.
 * - Required fields render a visible marker and set the control `required`.
 */
export function Field({
  label,
  children,
  error,
  description,
  required = false,
  id,
  className,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description != null ? `${fieldId}-description` : undefined;
  const errorId = error != null ? `${fieldId}-error` : undefined;

  // Reference both the hint and the error when present; `undefined` (rather than
  // an empty string) so the attribute is omitted when neither exists.
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const control: FieldControlProps = {
    id: fieldId,
    "aria-invalid": error != null,
    "aria-describedby": describedBy,
    required,
  };

  return (
    <div className={cn("flex flex-col gap-space-1", className)}>
      <label
        htmlFor={fieldId}
        className="font-sans text-caption font-medium text-text"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {description != null ? (
        <p id={descriptionId} className="font-sans text-caption text-muted">
          {description}
        </p>
      ) : null}

      {children(control)}

      {error != null ? (
        <p
          id={errorId}
          role="alert"
          className="font-sans text-caption font-medium text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
