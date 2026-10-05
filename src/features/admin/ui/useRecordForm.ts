"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import type { ActionResult } from "@/types";
import { useAdminFeedback } from "./feedback";

/**
 * Shared state for the sheet editors: which record is open, its draft
 * values, field errors, and a submit helper that calls a Server Action and
 * refreshes the page on success.
 */
export function useRecordForm<T extends object>(empty: T) {
  const router = useRouter();
  const { toast } = useAdminFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<T>(empty);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const openNew = useCallback((initial?: Partial<T>) => {
    setEditingId(null);
    setValues({ ...empty, ...initial });
    setErrors({});
    setOpen(true);
  }, [empty]);

  const openEdit = useCallback((id: string, current: T) => {
    setEditingId(id);
    setValues(current);
    setErrors({});
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const { [key as string]: _drop, ...rest } = e;
      return rest;
    });
  }, []);

  const submit = useCallback(
    async (action: (id: string | null, values: T) => Promise<ActionResult<unknown>>, success: string) => {
      setSubmitting(true);
      try {
        const result = await action(editingId, values);
        if (!result) return false;
        if (!result.success) {
          setErrors(result.fieldErrors ?? {});
          toast(result.formError ?? "Please fix the highlighted fields.", "error");
          return false;
        }
        toast(success);
        setOpen(false);
        router.refresh();
        return true;
      } catch {
        toast("Something went wrong. Please try again.", "error");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [editingId, values, router, toast],
  );

  return { open, editingId, values, errors, submitting, openNew, openEdit, close, set, submit, setValues };
}
