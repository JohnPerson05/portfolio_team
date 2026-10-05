"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { deleteMediaAsset } from "@/actions/media";
import { imageSource } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { MediaRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  Icon,
  Spinner,
  formatBytes,
  formatDate,
  useAdminFeedback,
} from "../ui";
import { ACCEPT_MEDIA, uploadFile } from "../ui/upload";

export function MediaLibrary({ assets }: { assets: MediaRow[] }) {
  const router = useRouter();
  const { toast, confirm } = useAdminFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState<"all" | "unused">("all");

  async function addFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setUploading(list.length);
    let ok = 0;
    for (const file of list) {
      try {
        await uploadFile(file, "media");
        ok += 1;
      } catch (err) {
        toast(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`, "error");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (ok > 0) {
      toast(`${ok} file${ok === 1 ? "" : "s"} uploaded`);
      router.refresh();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(asset: MediaRow) {
    const inUse = asset.usedBy.length > 0;
    const ok = await confirm({
      title: `Delete ${asset.filename}?`,
      description: inUse ? (
        <>
          <p>This file is still used by:</p>
          <ul className="mt-1 list-disc pl-5">
            {asset.usedBy.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="mt-2">Those places will show a broken image until you replace it.</p>
        </>
      ) : (
        "The file is permanently removed from storage."
      ),
      confirmLabel: inUse ? "Delete anyway" : "Delete",
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteMediaAsset(asset.id, { force: inUse });
    if (result.success) {
      toast("File deleted");
      router.refresh();
    } else {
      toast(result.formError ?? "Couldn't delete the file.", "error");
    }
  }

  async function copy(url: string) {
    const absolute = url.startsWith("/") ? `${window.location.origin}${url}` : url;
    try {
      await navigator.clipboard.writeText(absolute);
      toast("URL copied");
    } catch {
      toast("Couldn't copy — select the URL manually.", "error");
    }
  }

  const visible = filter === "unused" ? assets.filter((a) => a.usedBy.length === 0) : assets;

  return (
    <>
      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mb-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-dashed px-5 py-5 sm:flex-row",
          dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-white",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <Icon.Upload size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-900">Drop files to upload</p>
            <p className="text-xs text-zinc-500">JPG, PNG, WEBP, AVIF, GIF, SVG up to 10 MB · MP4 up to 50 MB</p>
          </div>
        </div>
        <AdminButton variant="primary" onClick={() => inputRef.current?.click()} disabled={uploading > 0}>
          {uploading > 0 ? (
            <>
              <Spinner /> Uploading {uploading}…
            </>
          ) : (
            <>
              <Icon.Upload size={14} /> Upload
            </>
          )}
        </AdminButton>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_MEDIA}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => void addFiles(e.target.files)}
        />
      </div>

      {assets.length > 0 ? (
        <div className="mb-3 flex items-center gap-1 text-sm" role="group" aria-label="Filter files">
          {(["all", "unused"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 rounded-md px-3 font-medium",
                filter === f ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {f === "all" ? `All (${assets.length})` : `Unused (${assets.filter((a) => a.usedBy.length === 0).length})`}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Image size={20} />}
          title={assets.length === 0 ? "No files yet." : "Every file is in use."}
          description={assets.length === 0 ? "Images you upload anywhere in the CMS appear here." : undefined}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((asset) => {
            const isVideo = asset.contentType.startsWith("video/");
            return (
              <li key={asset.id} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                  {isVideo ? (
                    <video src={asset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <Image {...imageSource(asset.url)} alt={asset.filename} fill sizes="(max-width: 640px) 90vw, 260px" className="object-contain" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="truncate text-[13px] font-medium text-zinc-900" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatBytes(asset.size)}
                    {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""} · {formatDate(asset.createdAt)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {asset.usedBy.length > 0 ? (
                      <span title={asset.usedBy.join("\n")}>
                        Used by <span className="font-medium text-zinc-700">{asset.usedBy[0]}</span>
                        {asset.usedBy.length > 1 ? ` +${asset.usedBy.length - 1}` : ""}
                      </span>
                    ) : (
                      <span className="text-amber-700">Not used anywhere</span>
                    )}
                  </p>
                  <div className="mt-auto flex gap-1 pt-2">
                    <AdminButton size="sm" variant="ghost" onClick={() => copy(asset.url)}>
                      <Icon.Copy size={13} /> Copy URL
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => remove(asset)} aria-label={`Delete ${asset.filename}`}>
                      <Icon.Trash size={13} />
                    </AdminButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
