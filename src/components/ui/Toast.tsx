"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Toast treatments. `error` is announced assertively (`role="alert"`); the
 * quieter `success`/`info` use a polite live region (`role="status"`).
 */
export type ToastVariant = "success" | "error" | "info";

/** A single toast's data, as held by the {@link ToastProvider} queue. */
export interface ToastItem {
  /** Stable id used as the React key and the `dismiss` target. */
  id: string;
  variant: ToastVariant;
  message: ReactNode;
  /**
   * Auto-dismiss delay in ms. `null` (or `0`) keeps the toast until dismissed
   * manually. Defaults to {@link DEFAULT_DURATION} when omitted on `show`.
   */
  duration: number | null;
}

/** Options accepted by `show`. `variant` defaults to `"info"`. */
export interface ShowToastOptions {
  variant?: ToastVariant;
  message: ReactNode;
  duration?: number | null;
}

export interface ToastProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: ToastVariant;
  /** The toast message/body. */
  message: ReactNode;
  /** When provided, renders a dismiss button that calls this on activation. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button. Defaults to "Dismiss notification". */
  dismissLabel?: string;
  className?: string;
}

const DEFAULT_DURATION = 5000;

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-text",
  error: "border-red-500/50 bg-red-500/10 text-text",
  info: "border-hairline bg-card text-text",
};

const variantAccent: Record<ToastVariant, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  info: "bg-accent",
};

/**
 * `Toast` — a presentational notification card (Req 8.4 success / 8.5 error).
 *
 * Announcement (Req 15.2): `error` toasts use `role="alert"` (assertive), so
 * screen readers interrupt to announce failures; `success`/`info` use
 * `role="status"` + `aria-live="polite"` so they're announced without
 * interrupting. The optional dismiss control is a real `<button>` — keyboard
 * operable with a visible focus ring and an accessible name.
 */
export function Toast({
  variant = "info",
  message,
  onDismiss,
  dismissLabel = "Dismiss notification",
  className,
  ...rest
}: ToastProps) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto relative flex items-start gap-space-2 overflow-hidden",
        "rounded-lg border px-space-3 py-space-2 shadow-lg",
        "font-sans text-body",
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          variantAccent[variant],
        )}
      />
      <p className="min-w-0 flex-1 text-pretty">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={cn(
            "-mr-1 -mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "text-muted transition-colors hover:text-text",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          <span aria-hidden="true" className="text-body-lg leading-none">
            ×
          </span>
        </button>
      ) : null}
    </div>
  );
}

/** Imperative API exposed by {@link useToast}. */
export interface ToastContextValue {
  /** Current toasts (oldest first). */
  toasts: ToastItem[];
  /** Enqueue a toast; returns its generated id. */
  show: (options: ShowToastOptions) => string;
  /** Remove a toast by id (no-op if already gone). */
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay (ms) for toasts that don't set one. */
  defaultDuration?: number | null;
}

/**
 * `ToastProvider` — holds the toast queue and renders the live region
 * ({@link ToastRegion}) so any descendant can call {@link useToast} to show
 * feedback. SSR-safe: no DOM access during render and timers run only after
 * mount (client effects). The contact form calls `show({ variant, message })`
 * on success/error.
 */
export function ToastProvider({
  children,
  defaultDuration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ variant = "info", message, duration }: ShowToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const resolvedDuration =
        duration === undefined ? defaultDuration : duration;
      setToasts((current) => [
        ...current,
        { id, variant, message, duration: resolvedDuration },
      ]);
      return id;
    },
    [defaultDuration],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, show, dismiss }),
    [toasts, show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Access the toast API. Must be used within a {@link ToastProvider}; throws a
 * clear error otherwise so misuse is caught early.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

export interface ToastRegionProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * `ToastRegion` — the fixed, stacked container that renders active toasts and
 * wires each one's auto-dismiss timer. Presentational aside from the timers;
 * the {@link ToastProvider} renders it, but it can be used standalone with a
 * custom queue.
 */
export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-space-2 px-space-4 py-space-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastRegionItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastRegionItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastRegionItem({ toast, onDismiss }: ToastRegionItemProps) {
  const { id, duration } = toast;

  useEffect(() => {
    if (duration === null || duration <= 0) {
      return;
    }
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <Toast
      variant={toast.variant}
      message={toast.message}
      onDismiss={() => onDismiss(id)}
      className="w-full max-w-sm"
    />
  );
}
