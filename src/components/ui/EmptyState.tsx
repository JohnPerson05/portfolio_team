import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Main message describing the empty state. Rendered as a real heading. */
  title: ReactNode;
  /** Optional supporting copy shown beneath the title. */
  description?: ReactNode;
  /**
   * Optional icon/illustration slot shown above the title. Rendered inside a
   * decorative wrapper and hidden from assistive tech (the `title` carries the
   * meaning), so pass a purely visual node.
   */
  icon?: ReactNode;
  /**
   * Optional action slot (e.g. a `Button` or link) shown beneath the copy.
   * `children` is treated as an action area too and rendered after `action`.
   */
  action?: ReactNode;
  /** Semantic element to render the title as. Defaults to `p`. */
  titleAs?: ElementType;
  className?: string;
  children?: ReactNode;
}

const baseStyles =
  "flex flex-col items-center justify-center gap-space-2 " +
  "rounded-lg border border-hairline border-dashed bg-bg-secondary/40 " +
  "px-space-6 py-space-12 text-center";

/**
 * `EmptyState` — a minimal, centered placeholder for empty lists (blog
 * preview/listing, admin contacts; Req 7.2 / 12.2). Muted styling keeps it
 * quiet; an optional accent-tinted icon, a title, optional description, and an
 * action slot give it just enough structure.
 *
 * Presentational and server-safe — no client state. The decorative `icon` is
 * `aria-hidden`; the `title` renders as a real element so the empty region has
 * an accessible name.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  titleAs,
  className,
  children,
  ...rest
}: EmptyStateProps) {
  const Title = titleAs ?? "p";
  return (
    <div className={cn(baseStyles, className)} {...rest}>
      {icon != null ? (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center text-accent [&_svg]:h-8 [&_svg]:w-8"
        >
          {icon}
        </span>
      ) : null}

      <Title className="font-display text-h3 font-semibold text-text text-balance">
        {title}
      </Title>

      {description != null ? (
        <p className="max-w-content font-sans text-body text-muted text-pretty">
          {description}
        </p>
      ) : null}

      {action != null || children != null ? (
        <div className="mt-space-2 flex flex-wrap items-center justify-center gap-space-2">
          {action}
          {children}
        </div>
      ) : null}
    </div>
  );
}
