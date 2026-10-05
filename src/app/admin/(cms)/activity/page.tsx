import type { Metadata } from "next";
import Link from "next/link";

import { listActivity } from "@/server/admin/queries";
import { AdminEmptyState, Icon, PageHeader, formatDateTime, timeAgo } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Activity" };

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: raw } = await searchParams;
  const page = Math.max(1, Number.parseInt(raw ?? "1", 10) || 1);
  const { rows, pages, total } = await listActivity(page);

  return (
    <>
      <PageHeader title="Activity" description={`Every change made in the CMS (${total} total).`} />
      {rows.length === 0 ? (
        <AdminEmptyState icon={<Icon.Activity size={20} />} title="No activity yet." description="Sign-ins and content changes will be listed here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <ol className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                <span className="w-32 shrink-0 text-xs text-zinc-500" title={formatDateTime(row.createdAt)}>
                  {timeAgo(row.createdAt)}
                </span>
                <span className="min-w-0 flex-1 text-sm text-zinc-800">{row.summary}</span>
                <span className="shrink-0 text-xs text-zinc-500">{row.actor}</span>
                <code className="hidden shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 md:inline">{row.action}</code>
              </li>
            ))}
          </ol>
          {pages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm">
              {page > 1 ? <Link href={`/admin/activity?page=${page - 1}`} className="font-medium text-zinc-600 hover:text-zinc-900">← Newer</Link> : <span />}
              <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
              {page < pages ? <Link href={`/admin/activity?page=${page + 1}`} className="font-medium text-zinc-600 hover:text-zinc-900">Older →</Link> : <span />}
            </nav>
          ) : null}
        </div>
      )}
    </>
  );
}
