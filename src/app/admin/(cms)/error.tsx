"use client";

import { useEffect } from "react";
import { AdminButton, Icon } from "@/features/admin/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Icon.Alert size={20} />
      </div>
      <h1 className="text-base font-semibold text-zinc-900">Something went wrong while loading this page.</h1>
      <p className="mt-1 text-sm text-zinc-500">
        This is usually a temporary connection problem. Your content is safe.
      </p>
      {error.digest ? <p className="mt-2 font-mono text-[11px] text-zinc-400">Ref: {error.digest}</p> : null}
      <AdminButton variant="primary" className="mt-5" onClick={reset}>
        Try again
      </AdminButton>
    </div>
  );
}
