"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ProjectVisual } from "./ProjectVisual";

export interface ProjectGalleryProps {
  title: string;
  imageUrls: readonly string[];
  technologies: readonly string[];
}

/** Interactive, keyboard-accessible gallery for a project case study. */
export function ProjectGallery({
  title,
  imageUrls,
  technologies,
}: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const requestedImage = imageUrls[activeIndex];
  const fallbackIndex = imageUrls.findIndex((url) => !failedImages.has(url));
  const displayIndex =
    requestedImage && !failedImages.has(requestedImage)
      ? activeIndex
      : fallbackIndex;
  const activeImage = imageUrls[displayIndex];

  if (!activeImage) {
    return <ProjectVisual title={title} technologies={technologies} />;
  }

  return (
    <section aria-label={`${title} image gallery`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#071018] sm:aspect-[16/9]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${title} screenshot ${displayIndex + 1} of ${imageUrls.length}`}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover"
          onError={() =>
            setFailedImages((current) => new Set(current).add(activeImage))
          }
        />
        <span className="absolute bottom-space-2 right-space-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-white/80 backdrop-blur">
          {displayIndex + 1} / {imageUrls.length}
        </span>
      </div>

      {imageUrls.length > 1 ? (
        <div className="grid grid-cols-3 gap-space-2 border-t border-hairline bg-bg-secondary p-space-2 sm:grid-cols-5">
          {imageUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              aria-label={`Show screenshot ${index + 1}`}
              aria-pressed={displayIndex === index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-video overflow-hidden rounded-md border bg-[#071018] transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                displayIndex === index
                  ? "border-accent opacity-100"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
            >
              {!failedImages.has(url) ? (
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover"
                  onError={() =>
                    setFailedImages((current) => new Set(current).add(url))
                  }
                />
              ) : (
                <span className="font-mono text-caption text-muted">
                  Unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
