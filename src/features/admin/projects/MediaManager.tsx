"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";

import { imageSource } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Icon,
  SortableList,
  Spinner,
  useAdminFeedback,
} from "../ui";
import { ACCEPT_MEDIA, uploadFile } from "../ui/upload";

export interface EditableMedia {
  /** Server id for saved rows; a temporary `new-…` key for unsaved ones. */
  key: string;
  id?: string;
  mediaType: "IMAGE" | "VIDEO" | "GIF" | "EMBED";
  url: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  altText: string;
}

let tempId = 0;
export function newMediaKey(): string {
  tempId += 1;
  return `new-${Date.now()}-${tempId}`;
}

function typeFor(contentType: string): EditableMedia["mediaType"] {
  if (contentType.startsWith("video/")) return "VIDEO";
  if (contentType === "image/gif") return "GIF";
  return "IMAGE";
}

function Preview({ item }: { item: EditableMedia }) {
  const thumb = item.thumbnailUrl || (item.mediaType === "IMAGE" || item.mediaType === "GIF" ? item.url : "");
  return (
    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
      {thumb ? (
        <Image {...imageSource(thumb)} alt="" fill sizes="128px" className="object-cover" />
      ) : item.mediaType === "VIDEO" ? (
        <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-zinc-400">
          {item.mediaType === "EMBED" ? <Icon.Link size={18} /> : <Icon.Image size={18} />}
        </span>
      )}
      {item.mediaType !== "IMAGE" ? (
        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] font-semibold uppercase text-white">
          {item.mediaType}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Project gallery editor: upload many files at once (drop or pick), add a
 * video/embed URL, reorder by dragging, and edit captions and alt text.
 */
export function MediaManager({
  value,
  onChange,
  coverImage,
  onSetCover,
}: {
  value: EditableMedia[];
  onChange: (next: EditableMedia[]) => void;
  coverImage: string;
  onSetCover: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const { toast } = useAdminFeedback();
  // Keep the latest list for async uploads that finish one by one.
  const latest = useRef(value);
  latest.current = value;

  async function addFiles(files: FileList | File[] | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const { url, contentType } = await uploadFile(file, "projects");
          const item: EditableMedia = {
            key: newMediaKey(),
            mediaType: typeFor(contentType),
            url,
            thumbnailUrl: "",
            title: "",
            caption: "",
            altText: "",
          };
          latest.current = [...latest.current, item];
          onChange(latest.current);
          if (!coverImage && item.mediaType === "IMAGE") onSetCover(url);
        } catch (err) {
          toast(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`, "error");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  function addEmbed() {
    const url = embedUrl.trim();
    if (!/^https:\/\//.test(url)) {
      toast("Use a full https:// link (YouTube, Vimeo, Loom, Figma, or an .mp4 file).", "error");
      return;
    }
    const isVideoFile = /\.(mp4|webm)(\?|$)/i.test(url);
    onChange([
      ...value,
      {
        key: newMediaKey(),
        mediaType: isVideoFile ? "VIDEO" : "EMBED",
        url: toEmbedUrl(url),
        thumbnailUrl: "",
        title: "",
        caption: "",
        altText: "",
      },
    ]);
    setEmbedUrl("");
  }

  const update = (key: string, patch: Partial<EditableMedia>) =>
    onChange(value.map((m) => (m.key === key ? { ...m, ...patch } : m)));

  return (
    <div className="flex flex-col gap-3">
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
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-zinc-50/50",
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
          <Icon.Upload size={16} />
        </span>
        <p className="text-sm font-medium text-zinc-800">Drop screenshots, GIFs, or MP4s here</p>
        <p className="text-xs text-zinc-500">Upload several at once — images up to 10 MB, videos up to 50 MB.</p>
        <AdminButton size="sm" onClick={() => inputRef.current?.click()} disabled={uploading > 0}>
          {uploading > 0 ? (
            <>
              <Spinner /> Uploading {uploading}…
            </>
          ) : (
            "Choose files"
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

      <div className="flex gap-2">
        <AdminInput
          type="url"
          value={embedUrl}
          onChange={(e) => setEmbedUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEmbed();
            }
          }}
          placeholder="Or paste a YouTube / Vimeo / Loom / Figma link"
          aria-label="Video or embed URL"
        />
        <AdminButton onClick={addEmbed} disabled={!embedUrl.trim()}>
          <Icon.Video size={14} /> Add
        </AdminButton>
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500">
          No gallery items yet. The first image becomes the card cover if you don&apos;t pick one.
        </p>
      ) : (
        <SortableList
          items={value.map((m) => ({ ...m, id: m.key }))}
          itemLabel={(m) => m.title || m.altText || "gallery item"}
          successMessage=""
          onReorder={async (ids) => {
            const byKey = new Map(value.map((m) => [m.key, m]));
            onChange(ids.map((id) => byKey.get(id)).filter((m): m is EditableMedia => !!m));
            return { success: true };
          }}
          className="flex flex-col gap-2"
          renderItem={(item, { handle, index }) => {
            const open = expanded === item.key;
            const isCover = !!coverImage && coverImage === item.url;
            return (
              <div className="rounded-lg border border-zinc-200 bg-white">
                <div className="flex items-center gap-3 p-2">
                  {handle}
                  <Preview item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-900">
                      {item.title || item.caption || `Item ${index + 1}`}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{item.url.replace(/^https?:\/\//, "")}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {isCover ? (
                        <span className="rounded bg-zinc-900 px-1.5 text-[10px] font-semibold uppercase text-white">Cover</span>
                      ) : null}
                      {!item.altText && item.mediaType !== "EMBED" ? (
                        <span className="rounded bg-amber-50 px-1.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">No alt text</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {item.mediaType === "IMAGE" && !isCover ? (
                      <AdminButton size="sm" variant="ghost" onClick={() => onSetCover(item.url)}>
                        Set cover
                      </AdminButton>
                    ) : null}
                    <AdminButton
                      size="sm"
                      variant="ghost"
                      aria-expanded={open}
                      onClick={() => setExpanded(open ? null : item.key)}
                    >
                      {open ? "Done" : "Edit"}
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="ghost"
                      aria-label="Remove from gallery"
                      onClick={() => onChange(value.filter((m) => m.key !== item.key))}
                    >
                      <Icon.Trash size={14} />
                    </AdminButton>
                  </div>
                </div>
                {open ? (
                  <div className="grid gap-3 border-t border-zinc-100 p-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-[13px] font-medium text-zinc-800">
                      Type
                      <AdminSelect
                        value={item.mediaType}
                        onChange={(e) => update(item.key, { mediaType: e.target.value as EditableMedia["mediaType"] })}
                      >
                        <option value="IMAGE">Image</option>
                        <option value="GIF">GIF</option>
                        <option value="VIDEO">Video file</option>
                        <option value="EMBED">Embed (YouTube, Vimeo…)</option>
                      </AdminSelect>
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-medium text-zinc-800">
                      Title
                      <AdminInput value={item.title} onChange={(e) => update(item.key, { title: e.target.value })} placeholder="e.g. Booking flow" />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-medium text-zinc-800 sm:col-span-2">
                      Alt text <span className="text-xs font-normal text-zinc-500">Describe the image for screen readers and search engines.</span>
                      <AdminInput value={item.altText} onChange={(e) => update(item.key, { altText: e.target.value })} placeholder="Dashboard showing today's appointments" />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-medium text-zinc-800 sm:col-span-2">
                      Caption
                      <AdminInput value={item.caption} onChange={(e) => update(item.key, { caption: e.target.value })} placeholder="Shown under the image on the case study" />
                    </label>
                    {item.mediaType === "VIDEO" || item.mediaType === "EMBED" ? (
                      <label className="flex flex-col gap-1 text-[13px] font-medium text-zinc-800 sm:col-span-2">
                        Thumbnail URL
                        <AdminInput value={item.thumbnailUrl} onChange={(e) => update(item.key, { thumbnailUrl: e.target.value })} placeholder="Optional poster image" />
                      </label>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}

/** Turn common share links into embeddable player URLs. */
export function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "vimeo.com") return `https://player.vimeo.com/video${u.pathname}`;
    if (u.hostname.endsWith("loom.com") && u.pathname.startsWith("/share/")) {
      return `https://www.loom.com/embed/${u.pathname.slice("/share/".length)}`;
    }
    if (u.hostname.endsWith("figma.com") && !u.hostname.startsWith("embed.")) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    }
  } catch {
    /* fall through */
  }
  return url;
}
