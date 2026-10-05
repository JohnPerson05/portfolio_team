"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { deletePost } from "@/actions/posts";
import {
  POST_DELETE_CANCEL,
  POST_DELETE_CONFIRM,
  POST_DELETE_DESCRIPTION,
  POST_DELETE_LABEL,
  POST_DELETE_TITLE,
  POST_DELETING_LABEL,
  POST_GENERIC_ERROR,
} from "./config";

export interface DeletePostButtonProps {
  /** Id of the post to delete. */
  postId: string;
  /** Title shown in the confirmation prompt for clarity. */
  postTitle: string;
}

/**
 * `DeletePostButton` — a guarded delete control with a confirmation dialog
 * (Requirement 11.3).
 *
 * Clicking "Delete" opens a modal `<dialog role="alertdialog">` that asks the
 * owner to confirm before anything is removed; only the explicit confirm button
 * invokes the {@link deletePost} Server Action (which itself re-checks the
 * session — Property 7). Cancelling or pressing Escape closes the dialog with no
 * mutation. On success the list is refreshed so the deletion reflects
 * immediately.
 *
 * Accessibility: the dialog is rendered as a native `<dialog>` opened with
 * `showModal()` (focus trap + Escape handling for free), labelled by its title
 * and described by its body. Mirrors `DeleteProjectButton` (Task 22).
 */
export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Keep the native dialog's modal state in sync with React state so it gets
  // the built-in focus trap, backdrop, and Escape-to-close behavior.
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
      const result = await deletePost(postId);
      if (result.success) {
        setOpen(false);
        router.refresh();
        return;
      }
      setError(result.formError ?? POST_GENERIC_ERROR);
      setDeleting(false);
    } catch {
      setError(POST_GENERIC_ERROR);
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
        {POST_DELETE_LABEL}
      </Button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`delete-title-${postId}`}
        aria-describedby={`delete-desc-${postId}`}
        onClose={() => {
          setOpen(false);
          setDeleting(false);
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-hairline bg-card p-space-6 text-text backdrop:bg-black/70"
      >
        <div className="flex flex-col gap-space-3">
          <h2
            id={`delete-title-${postId}`}
            className="font-display text-h3 font-semibold text-text"
          >
            {POST_DELETE_TITLE}
          </h2>
          <p
            id={`delete-desc-${postId}`}
            className="font-sans text-body text-muted"
          >
            {POST_DELETE_DESCRIPTION}
          </p>
          <p className="font-sans text-body font-medium text-text">
            {postTitle}
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
              {POST_DELETE_CANCEL}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? POST_DELETING_LABEL : POST_DELETE_CONFIRM}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
