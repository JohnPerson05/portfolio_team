import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "aria-invalid"> {
  /**
   * Drives the error visual state. When `true` the input also reports
   * `aria-invalid="true"`. The same visual state is applied when
   * `aria-invalid` is set to a truthy value (e.g. by {@link Field}), so a
   * standalone `invalid` flag and a `Field`-injected `aria-invalid` behave
   * identically.
   */
  invalid?: boolean;
  /** Mirror of the native attribute, narrowed to the values we render. */
  "aria-invalid"?: boolean | "true" | "false";
  /** Forwarded to the underlying `<input>` element (React 19 ref-as-prop). */
  ref?: Ref<HTMLInputElement>;
  className?: string;
}

const baseStyles =
  "w-full min-h-11 rounded-lg border bg-bg-secondary px-space-2 py-space-1 " +
  "font-sans text-body text-text placeholder:text-muted " +
  "transition-[border-color,box-shadow] duration-200 ease-out " +
  // Visible, accent-tinted keyboard focus ring (mirrors the global token).
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * `Input` — a styled text input that extends every native input attribute
 * (`name`, `type`, `value`/`defaultValue`, `placeholder`, `required`, …).
 *
 * It keeps a `>=44px` min height for accessible touch targets (Req 16.3),
 * shows a visible focus ring (Req 15.2), and exposes an error-driven visual
 * state via the `invalid` prop or an injected `aria-invalid`. Pair it with
 * {@link Field} for label + error wiring, or use it standalone.
 */
export function Input({
  invalid,
  "aria-invalid": ariaInvalid,
  className,
  ref,
  ...rest
}: InputProps) {
  const isInvalid =
    invalid === true || ariaInvalid === true || ariaInvalid === "true";

  return (
    <input
      ref={ref}
      aria-invalid={isInvalid ? true : ariaInvalid}
      className={cn(
        baseStyles,
        isInvalid
          ? "border-red-500/70 focus-visible:outline-red-500"
          : "border-hairline focus-visible:border-accent",
        className,
      )}
      {...rest}
    />
  );
}
