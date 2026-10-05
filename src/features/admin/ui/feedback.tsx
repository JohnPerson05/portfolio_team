"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { Icon } from "./icons";
import { AdminButton } from "./primitives";

/* -------------------------------------------------------------------------- */
/* Toasts + confirm dialog (one provider for both)                            */
/* -------------------------------------------------------------------------- */

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "default";
}

interface FeedbackContextValue {
  toast: (message: string, tone?: ToastTone) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-3), { id, tone, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), tone === "error" ? 7000 : 3500);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-lg",
              t.tone === "error" ? "border-red-200 text-red-800" : "border-zinc-200 text-zinc-800",
            )}
          >
            <span className={cn("mt-0.5", t.tone === "error" ? "text-red-600" : t.tone === "success" ? "text-emerald-600" : "text-zinc-500")}>
              {t.tone === "error" ? <Icon.Alert size={15} /> : <Icon.Check size={15} />}
            </span>
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>
      {pending ? <ConfirmDialog options={pending} onClose={close} /> : null}
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose(false);
      }}
      className="w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-base font-semibold">
          {options.title}
        </h2>
        {options.description ? <div className="mt-2 text-sm text-zinc-600">{options.description}</div> : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3">
        <AdminButton onClick={() => onClose(false)}>Cancel</AdminButton>
        <AdminButton
          autoFocus
          variant={options.tone === "danger" ? "danger" : "primary"}
          onClick={() => onClose(true)}
        >
          {options.confirmLabel ?? "Confirm"}
        </AdminButton>
      </div>
    </dialog>
  );
}

export function useAdminFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    // Fallback so components still work outside the provider (tests).
    return {
      toast: () => undefined,
      confirm: async (o) => window.confirm(o.title),
    };
  }
  return ctx;
}

/**
 * Run a Server Action with pending state, toasts, and a router refresh.
 *
 *   const { run, pending } = useAdminAction();
 *   run(() => setProjectStatus(id, "PUBLISHED"), { success: "Published" });
 */
export function useAdminAction() {
  const router = useRouter();
  const { toast } = useAdminFeedback();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    <T,>(
      action: () => Promise<ActionResult<T>>,
      options: { success?: string; onSuccess?: (data: T | undefined) => void; refresh?: boolean } = {},
    ): Promise<ActionResult<T>> =>
      new Promise((resolve) => {
        startTransition(async () => {
          try {
            const result = await action();
            // A redirect (e.g. expired session → login) resolves with nothing.
            if (!result) {
              resolve({ success: false });
              return;
            }
            if (result.success) {
              if (options.success) toast(options.success);
              options.onSuccess?.(result.data);
              if (options.refresh !== false) router.refresh();
            } else {
              toast(result.formError ?? "Something went wrong. Please try again.", "error");
            }
            resolve(result);
          } catch (error) {
            // Redirects (e.g. session expired) must propagate.
            if (error && typeof error === "object" && "digest" in error) throw error;
            toast("Something went wrong. Please try again.", "error");
            resolve({ success: false, formError: "Unexpected error" });
          }
        });
      }),
    [router, toast],
  );

  return { run, pending };
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                     */
/* -------------------------------------------------------------------------- */

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  size = "md",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md";
}) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-4 w-7" : "h-5 w-9",
        checked ? "bg-emerald-600" : "bg-zinc-300",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block rounded-full bg-white shadow transition-transform",
          size === "sm" ? "h-3 w-3" : "h-4 w-4",
          checked ? (size === "sm" ? "translate-x-3.5" : "translate-x-[18px]") : "translate-x-0.5",
        )}
      />
    </button>
  );
  if (!label) return control;
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={switchId} className="cursor-pointer">
        <span className="block text-[13px] font-medium text-zinc-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-zinc-500">{description}</span> : null}
      </label>
      {control}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { id: T; label: ReactNode; badge?: ReactNode }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-1 overflow-x-auto border-b border-zinc-200">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900",
              selected ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800",
            )}
          >
            {tab.label}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Row action menu                                                            */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "danger";
  disabled?: boolean;
  hidden?: boolean;
}

export function RowMenu({ items, label = "Actions" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter((item) => !item.hidden);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
      >
        <Icon.More />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {visible.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors disabled:opacity-40",
                item.tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50",
              )}
            >
              <span className="text-current opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
