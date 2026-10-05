"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { MagneticButton } from "@/components/motion";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  /** Visual treatment. Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Sizing scale. Defaults to `md`. All sizes meet the 44px touch target. */
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

/**
 * `Button` is a discriminated union on the presence of `href`:
 *
 * - Without `href` it renders a native `<button>` (the default) and accepts all
 *   button attributes plus an optional `magnetic` flag that routes rendering
 *   through the {@link MagneticButton} motion primitive.
 * - With `href` it renders a semantic `<a>` link and accepts anchor attributes.
 *   `magnetic` is unavailable in link mode (the magnetic primitive is a button).
 *
 * In every mode the element keeps its accessible name (text children or
 * `aria-label`), is keyboard operable, shows a visible `:focus-visible` ring,
 * and respects `disabled` (button mode prevents activation).
 */
export type ButtonProps =
  | (ButtonOwnProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & {
        href?: undefined;
        /** Render through the magnetic motion primitive (button mode only). */
        magnetic?: boolean;
      })
  | (ButtonOwnProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & {
        /** Rendering as an anchor link. */
        href: string;
        magnetic?: never;
      });

const baseStyles =
  "inline-flex items-center justify-center rounded-lg no-underline " +
  "font-sans font-medium leading-none " +
  "transition-[transform,background-color,border-color,color] duration-200 ease-out " +
  "select-none cursor-pointer " +
  // Visible, accent-tinted keyboard focus ring (mirrors the global token).
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  // Disabled / aria-disabled cannot be activated and read as inert.
  "disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-bg hover:bg-accent/90 active:bg-accent/80",
  ghost: "bg-transparent text-text hover:bg-card",
  outline:
    "border border-hairline bg-transparent text-text hover:border-accent hover:text-accent",
};

// Every size keeps a >=44px min target height for accessible touch (Req 16.3).
const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 gap-1.5 px-space-2 text-caption",
  md: "min-h-11 gap-2 px-space-3 text-body",
  lg: "min-h-12 gap-2 px-space-4 text-body-lg",
};

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    props.className,
  );

  // Link mode — discriminated by the presence of `href`.
  if (props.href !== undefined) {
    const {
      variant: _variant,
      size: _size,
      className: _className,
      children,
      href,
      magnetic: _magnetic,
      ...anchorProps
    } = props;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const {
    variant: _variant,
    size: _size,
    className: _className,
    children,
    magnetic,
    href: _href,
    ...buttonProps
  } = props;

  if (magnetic) {
    return (
      <MagneticButton className={classes} {...buttonProps}>
        {children}
      </MagneticButton>
    );
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
