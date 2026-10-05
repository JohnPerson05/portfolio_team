import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { Icon } from "./icons";

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type AdminButtonSize = "sm" | "md";

const VARIANTS: Record<AdminButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm",
  secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm",
  ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
};

const SIZES: Record<AdminButtonSize, string> = {
  sm: "h-8 px-2.5 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
};

export function buttonClasses(
  variant: AdminButtonVariant = "secondary",
  size: AdminButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  function AdminButton(
    { variant = "secondary", size = "md", loading = false, className, children, disabled, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {loading ? <Spinner /> : null}
        {children}
      </button>
    );
  },
);

export function AdminLinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
  external = false,
}: {
  href: string;
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses(variant, size, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

export type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "violet";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({
  tone = "neutral",
  children,
  dot = false,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

const STATUS: Record<string, { tone: BadgeTone; label: string }> = {
  PUBLISHED: { tone: "green", label: "Published" },
  DRAFT: { tone: "amber", label: "Draft" },
  ARCHIVED: { tone: "neutral", label: "Archived" },
  TRASH: { tone: "red", label: "In trash" },
  HIDDEN: { tone: "neutral", label: "Hidden" },
};

export function StatusBadge({ status }: { status: keyof typeof STATUS | string }) {
  const entry = STATUS[status] ?? { tone: "neutral" as const, label: status };
  return (
    <Badge tone={entry.tone} dot>
      {entry.label}
    </Badge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <StatusBadge status={published ? "PUBLISHED" : "HIDDEN"} />;
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  meta?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <Icon.ArrowLeft size={14} />
            {back.label}
          </Link>
        ) : null}
        <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p> : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-xl border border-zinc-200 bg-white shadow-sm", className)}>
      {title || actions ? (
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-4 py-3 sm:px-5">
          <div>
            {title ? <h2 className="text-sm font-semibold text-zinc-900">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("admin-skeleton", className)} />;
}

/** Generic list-page skeleton used by admin `loading.tsx` files. */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0">
            <Skeleton className="h-10 w-14" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form controls                                                              */
/* -------------------------------------------------------------------------- */

const controlBase =
  "block w-full rounded-md border border-zinc-300 bg-white text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 " +
  "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500 " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500";

export const AdminInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AdminInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, "h-9 px-3", className)} {...props} />;
  },
);

export const AdminTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function AdminTextarea({ className, rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(controlBase, "px-3 py-2 leading-relaxed", className)} {...props} />;
  },
);

export const AdminSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function AdminSelect({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(controlBase, "h-9 px-2.5 pr-8", className)} {...props}>
        {children}
      </select>
    );
  },
);

/**
 * Label + control + hint/error. Pass the control as children; wire its `id`
 * to `htmlFor` and `aria-describedby` to `${id}-hint` / `${id}-error`.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
  aside,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[];
  required?: boolean;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-zinc-800">
          {label}
          {required ? <span className="ml-0.5 text-red-500" aria-hidden="true">*</span> : null}
        </label>
        {aside ? <span className="text-xs text-zinc-400">{aside}</span> : null}
      </div>
      {children}
      {message ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
          {message}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Props that connect a control to its {@link FormField}. */
export function fieldProps(id: string, error?: string | string[]) {
  return {
    id,
    "aria-invalid": error && (Array.isArray(error) ? error.length > 0 : true) ? true : undefined,
    "aria-describedby": error ? `${id}-error` : `${id}-hint`,
  } as const;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "3 min ago", "yesterday", "Mar 4". */
export function timeAgo(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "—";
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
