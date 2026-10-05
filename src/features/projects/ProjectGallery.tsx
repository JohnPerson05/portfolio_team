"use client";

import { useState } from "react";
import Image from "next/image";

import { imageSource } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { ProjectMediaView } from "@/types";
import { isAllowedEmbed } from "./config";
import { ProjectVisual } from "./ProjectVisual";

export interface ProjectGalleryProps {
  title: string;
  media: readonly ProjectMediaView[];
  technologies: readonly string[];
}

function altFor(item: ProjectMediaView, title: string, index: number, total: number) {
  return item.altText ?? `${title} — screenshot ${index + 1} of ${total}`;
}

/** The large stage for the active item. */
function Stage({
  item,
  title,
  index,
  total,
  onImageError,
}: {
  item: ProjectMediaView;
  title: string;
  index: number;
  total: number;
  onImageError: () => void;
}) {
  if (item.mediaType === "VIDEO") {
    return (
      <video
        key={item.url}
        src={item.url}
        poster={item.thumbnailUrl}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full bg-black object-contain"
        aria-label={item.title ?? altFor(item, title, index, total)}
      />
    );
  }
  if (item.mediaType === "EMBED") {
    return isAllowedEmbed(item.url) ? (
      <iframe
        key={item.url}
        src={item.url}
        title={item.title ?? `${title} walkthrough`}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0 bg-black"
      />
    ) : null;
  }
  return (
    <Image
      key={item.url}
      {...imageSource(item.url)}
      alt={altFor(item, title, index, total)}
      fill
      priority={index === 0}
      sizes="(max-width: 1280px) 100vw, 1200px"
      className="object-cover"
      onError={onImageError}
    />
  );
}

/** Interactive, keyboard-accessible gallery for a project case study. */
export function ProjectGallery({ title, media, technologies }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const items = media.filter(
    (item) =>
      !failed.has(item.url) &&
      (item.mediaType !== "EMBED" || isAllowedEmbed(item.url)),
  );
  const active = items[Math.min(activeIndex, items.length - 1)];

  if (!active) {
    return <ProjectVisual title={title} technologies={technologies} />;
  }
  const activePosition = items.indexOf(active);

  return (
    <section aria-label={`${title} gallery`}>
      <figure>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#071018] sm:aspect-[16/9]">
          <Stage
            item={active}
            title={title}
            index={activePosition}
            total={items.length}
            onImageError={() =>
              setFailed((current) => new Set(current).add(active.url))
            }
          />
          {items.length > 1 ? (
            <span className="pointer-events-none absolute bottom-space-2 right-space-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-white/80 backdrop-blur">
              {activePosition + 1} / {items.length}
            </span>
          ) : null}
        </div>
        {active.caption || active.title ? (
          <figcaption className="border-t border-hairline bg-bg-secondary px-space-3 py-space-2 text-caption text-muted">
            {active.title ? (
              <span className="font-medium text-text">{active.title}</span>
            ) : null}
            {active.title && active.caption ? " — " : null}
            {active.caption}
          </figcaption>
        ) : null}
      </figure>

      {items.length > 1 ? (
        <div className="grid grid-cols-3 gap-space-2 border-t border-hairline bg-bg-secondary p-space-2 sm:grid-cols-5 lg:grid-cols-6">
          {items.map((item, index) => {
            const thumb = item.thumbnailUrl ?? (item.mediaType === "IMAGE" || item.mediaType === "GIF" ? item.url : undefined);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.mediaType === "VIDEO" ? "video" : item.mediaType === "EMBED" ? "walkthrough" : "image"} ${index + 1}`}
                aria-pressed={activePosition === index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative flex aspect-video items-center justify-center overflow-hidden rounded-md border bg-[#071018] transition",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  activePosition === index
                    ? "border-accent opacity-100"
                    : "border-white/10 opacity-60 hover:opacity-100",
                )}
              >
                {thumb ? (
                  <Image
                    {...imageSource(thumb)}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                    onError={() => setFailed((current) => new Set(current).add(item.url))}
                  />
                ) : null}
                {item.mediaType === "VIDEO" || item.mediaType === "EMBED" ? (
                  <span
                    aria-hidden="true"
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/60 text-[0.7rem] text-white"
                  >
                    ▶
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
