import type { Metadata } from "next";

import { listMedia } from "@/server/admin/queries";
import { storageMode } from "@/server/media/storage";
import { MediaLibrary } from "@/features/admin/site/MediaLibrary";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Media" };

export default async function AdminMediaPage() {
  const assets = await listMedia();
  const mode = storageMode();
  return (
    <>
      <PageHeader title="Media" description="Every file uploaded through the CMS, and where it's used." />
      {mode === "local" ? (
        <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-900">
          Development mode: uploads are saved to <code>public/uploads</code>. Set <code>BLOB_READ_WRITE_TOKEN</code> to use Vercel Blob.
        </p>
      ) : mode === "disabled" ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          Uploads are off: <code>BLOB_READ_WRITE_TOKEN</code> isn&apos;t configured on this deployment. You can still paste image URLs into any image field.
        </p>
      ) : null}
      <MediaLibrary assets={assets} />
    </>
  );
}
