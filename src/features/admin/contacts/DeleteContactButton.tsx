"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { deleteContact } from "@/actions/contacts";
import {
  ADMIN_CONTACTS_HREF,
  CONTACT_DELETE_CANCEL,
  CONTACT_DELETE_CONFIRM,
  CONTACT_DELETE_DESCRIPTION,
  CONTACT_DELETE_LABEL,
  CONTACT_DELETE_TITLE,
  CONTACT_DELETING_LABEL,
  CONTACT_GENERIC_ERROR,
} from "./config";

export interface DeleteContactButtonProps {
  contactId: string;
  contactName: string;
  /** When set, navigate here after a successful delete (detail page). */
  redirectTo?: string;
}

/**
 * Guarded delete control for a contact inquiry. Confirmation uses a native
 * modal dialog; the Server Action re-checks the admin session before writing.
 */
export function DeleteContactButton({
  contactId,
  contactName,
  redirectTo = ADMIN_CONTACTS_HREF,
}: DeleteContactButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(undefined);
    try {
      const result = await deleteContact(contactId);
      if (result.success) {
        setOpen(false);
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setError(result.formError ?? CONTACT_GENERIC_ERROR);
      setDeleting(false);
    } catch {
      setError(CONTACT_GENERIC_ERROR);
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
        aria-haspopup="dialog"
      >
        {CONTACT_DELETE_LABEL}
      </Button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`delete-contact-title-${contactId}`}
        aria-describedby={`delete-contact-desc-${contactId}`}
        onClose={() => {
          setOpen(false);
          setDeleting(false);
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-hairline bg-card p-space-6 text-text backdrop:bg-black/70"
      >
        <div className="flex flex-col gap-space-3">
          <h2
            id={`delete-contact-title-${contactId}`}
            className="font-display text-h3 font-semibold text-text"
          >
            {CONTACT_DELETE_TITLE}
          </h2>
          <p
            id={`delete-contact-desc-${contactId}`}
            className="font-sans text-body text-muted"
          >
            {CONTACT_DELETE_DESCRIPTION}
          </p>
          <p className="font-sans text-body font-medium text-text">
            {contactName}
          </p>

          {error ? (
            <p
              role="alert"
              className="font-sans text-body font-medium text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-space-2 flex flex-wrap items-center justify-end gap-space-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              {CONTACT_DELETE_CANCEL}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? CONTACT_DELETING_LABEL : CONTACT_DELETE_CONFIRM}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
