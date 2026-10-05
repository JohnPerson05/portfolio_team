"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";

import { imageSource, isVideoUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { UploadFolder } from "@/server/media/storage";
import { useAdminFeedback } from "./feedback";
import { Icon } from "./icons";
import { AdminButton, AdminInput, Spinner } from "./primitives";
import { ACCEPT_IMAGES, uploadFile } from "./upload";

/**
 * Single image input: drag a file in, pick one, or paste a URL. Shows a live
 * preview. The value is the image URL (or "" for none).
 */
export function ImageField({
  value,
  onChange,
  folder,
  label,
  hint,
  error,
  aspect = "aspect-video",
  accept = ACCEPT_IMAGES,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label: string;
  hint?: string;
  error?: string | string[];
  aspect?: string;
  accept?: string;
  compact?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [broken, setBroken] = useState(false);
  const { toast } = useAdminFeedback();
  const message = Array.isArray(error) ? error[0] : error;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file, folder);
      setBroken(false);
      onChange(url);
      toast("Image uploaded");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span id={`${id}-label`} className="text-[13px] font-medium text-zinc-800">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          {showUrl ? "Hide URL" : "Use a URL"}
        </button>
      </div>

      <div
        role="group"
        aria-labelledby={`${id}-label`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group relative overflow-hidden rounded-lg border border-dashed transition-colors",
          compact ? "h-28" : aspect,
          dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-zinc-50/60",
          message && "border-red-400",
        )}
      >
        {value && !broken ? (
          <>
            {isVideoUrl(value) ? (
              <video src={value} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
            ) : (
              <Image
                {...imageSource(value)}
                alt=""
                fill
                sizes="(max-width: 768px) 90vw, 28rem"
                className="object-cover"
                onError={() => setBroken(true)}
              />
            )}
            <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/40 via-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <AdminButton size="sm" onClick={() => inputRef.current?.click()}>
                <Icon.Upload size={14} /> Replace
              </AdminButton>
              <AdminButton size="sm" onClick={() => onChange("")} aria-label={`Remove ${label}`}>
                <Icon.Trash size={14} />
              </AdminButton>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900"
          >
            {broken ? <Icon.Alert size={20} /> : <Icon.Image size={20} />}
            <span className="text-[13px] font-medium">
              {broken ? "Image can't be loaded — replace it" : "Drop an image or click to upload"}
            </span>
            {!compact ? <span className="text-xs text-zinc-400">JPG, PNG, WEBP, GIF, SVG · up to 10 MB</span> : null}
          </button>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-sm text-zinc-700">
            <Spinner /> Uploading…
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {showUrl ? (
        <AdminInput
          type="url"
          inputMode="url"
          placeholder="https://… or /images/…"
          value={value}
          aria-label={`${label} URL`}
          onChange={(event) => {
            setBroken(false);
            onChange(event.target.value);
          }}
        />
      ) : null}
      {message ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {message}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
