import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "aria-invalid"> {
  /**
   * Drives the error visual state. When `true` the textarea also reports
   * `aria-invalid="true"`. The same visual state is applied when
   * `aria-invalid` is set to a truthy value (e.g. by {@link Field}).
   */
  invalid?: boolean;
  /** Mirror of the native attribute, narrowed to the values we render. */
  "aria-invalid"?: boolean | "true" | "false";
  /** Forwarded to the underlying `<textarea>` element (React 19 ref-as-prop). */
  ref?: Ref<HTMLTextAreaElement>;
  className?: string;
}

const baseStyles =
  "w-full min-h-24 resize-y rounded-lg border bg-bg-secondary px-space-2 py-space-1 " +
  "font-sans text-body leading-relaxed text-text placeholder:text-muted " +
  "transition-[border-color,box-shadow] duration-200 ease-out " +
  // Visible, accent-tinted keyboard focus ring (mirrors the global token).
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * `Textarea` — a styled multiline input mirroring {@link Input}. It defaults to
 * vertical resize (`resize-y`) and a comfortable min height, accepts the native
 * `rows` attribute, shows a visible focus ring (Req 15.2), and exposes the same
 * error-driven visual state via `invalid` or an injected `aria-invalid`. Pair
 * it with {@link Field} for label + error wiring.
 */
export function Textarea({
  invalid,
  "aria-invalid": ariaInvalid,
  rows = 4,
  className,
  ref,
  ...rest
}: TextareaProps) {
  const isInvalid =
    invalid === true || ariaInvalid === true || ariaInvalid === "true";

  return (
    <textarea
      ref={ref}
      rows={rows}
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
