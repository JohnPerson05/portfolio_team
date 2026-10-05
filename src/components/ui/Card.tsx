import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hover treatments for a {@link Card}. Default cards are intentionally
 * non-flashy; opt into a subtle treatment when the surface is interactive.
 *
 * - `lift`   — gently raises and tints the border on hover.
 * - `glow`   — adds a faint accent glow on hover.
 * - `border` — brightens the hairline border toward the accent on hover.
 */
export type CardHover = "lift" | "glow" | "border";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Optional hover treatment. Omit for a static, non-flashy surface. */
  hover?: CardHover;
  /** Render element. Defaults to a semantic `<div>`. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

const baseStyles =
  "rounded-lg border border-hairline bg-card text-text " +
  "transition-[transform,border-color,box-shadow] duration-200 ease-out";

const hoverStyles: Record<CardHover, string> = {
  lift: "hover:-translate-y-1 hover:border-accent/40 motion-reduce:hover:translate-y-0",
  glow: "hover:shadow-[0_0_0_1px_rgba(212,175,55,0.2),0_12px_40px_-12px_rgba(212,175,55,0.25)]",
  border: "hover:border-accent",
};

/**
 * `Card` — a premium, minimal surface built from the design tokens
 * (`bg-card` + `border-hairline` + `rounded-lg`). Elevation is conveyed with a
 * hairline border rather than heavy shadows. Pass `hover` to opt into a subtle
 * interactive treatment.
 */
export function Card({ hover, as, className, children, ...rest }: CardProps) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(baseStyles, hover && hoverStyles[hover], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
