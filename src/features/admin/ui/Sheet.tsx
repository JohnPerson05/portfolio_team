"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";

import { Icon } from "./icons";
import { AdminButton } from "./primitives";

/**
 * Slide-over editor panel (a modal `<dialog>`): edit a record without leaving
 * the list. Escape or the backdrop closes it.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  submitting = false,
  footerExtra,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  footerExtra?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-none w-full ${wide ? "max-w-2xl" : "max-w-lg"} border-l border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/30`}
    >
      {open ? (
        <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
          <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div>
              <h2 id={titleId} className="text-base font-semibold">
                {title}
              </h2>
              {description ? <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Icon.X />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">{children}</div>
          </div>
          <footer className="flex items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
            <div>{footerExtra}</div>
            <div className="flex gap-2">
              <AdminButton onClick={onClose}>Cancel</AdminButton>
              <AdminButton type="submit" variant="primary" loading={submitting}>
                {submitLabel}
              </AdminButton>
            </div>
          </footer>
        </form>
      ) : null}
    </dialog>
  );
}
