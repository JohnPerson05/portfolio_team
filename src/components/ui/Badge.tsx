import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Visual treatments for a {@link Badge}. `default` is a quiet, neutral pill;
 * `accent` tints toward the gold accent and is used sparingly for emphasis.
 */
export type BadgeVariant = "default" | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pill treatment. Defaults to `default` (neutral). */
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const baseStyles =
  "inline-flex items-center rounded-full border px-space-2 py-0.5 " +
  "font-sans text-caption font-medium leading-none whitespace-nowrap";

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-hairline bg-bg-secondary text-muted",
  accent: "border-accent/40 bg-accent/10 text-accent",
};

/**
 * `Badge` — a small pill for technologies, tags, and labels. Minimal by
 * default; reserve the `accent` variant for sparing emphasis.
 */
export function Badge({
  variant = "default",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...rest}>
      {children}
    </span>
  );
}

/** `Tag` is an alias of {@link Badge} for technology/label lists. */
export const Tag = Badge;
export type TagProps = BadgeProps;
