/**
 * Shared result shapes for Server Actions (Requirement 8.3, 8.5, 10.4).
 *
 * Actions return a discriminated union so clients can branch on `success` and
 * render field-level errors, a form-level error, or a success state.
 */

/** Per-field validation errors keyed by field name (from Zod `flatten`). */
export type FieldErrors = Record<string, string[]>;

export interface ActionSuccess<TData = undefined> {
  success: true;
  data?: TData;
}

export interface ActionFailure {
  success: false;
  /** Field-level validation errors to render inline. */
  fieldErrors?: FieldErrors;
  /** A form-level error message (e.g. rate limit, unexpected failure). */
  formError?: string;
}

/** Discriminated union returned by mutating Server Actions. */
export type ActionResult<TData = undefined> =
  | ActionSuccess<TData>
  | ActionFailure;
