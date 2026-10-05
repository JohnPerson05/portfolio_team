"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ProjectVisualProps {
  title: string;
  thumbnailUrl?: string;
  technologies: readonly string[];
  href?: string;
}

export function ProjectVisual({
  title,
  thumbnailUrl,
  technologies,
  href,
}: ProjectVisualProps) {
  const [imageAvailable, setImageAvailable] = useState(Boolean(thumbnailUrl));
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group/visual relative aspect-[16/10] w-full overflow-hidden border-b border-hairline bg-[#071018] sm:aspect-[16/9]">
      {href ? (
        <Link
          href={href}
          aria-label={`View ${title} case study`}
          className="absolute inset-0 z-10"
        />
      ) : null}
      {thumbnailUrl && imageAvailable ? (
        <Image
          src={thumbnailUrl}
          alt={`${title} preview`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover/visual:scale-[1.025] motion-reduce:transform-none"
          onError={() => setImageAvailable(false)}
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-75 transition-transform duration-700 ease-out group-hover/visual:scale-[1.03] motion-reduce:transform-none"
            style={{
              backgroundImage: "url('/images/enterprise-grid-background.svg')",
            }}
          />
          <div
            aria-hidden="true"
            className="programmatic-grid absolute inset-0 opacity-50"
          />
          <div className="from-bg/5 to-bg/70 absolute inset-0 bg-gradient-to-br via-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/15 bg-black/25 shadow-2xl backdrop-blur-md">
              <span className="text-signal font-display text-h2 font-semibold tracking-tight">
                {initials}
              </span>
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-[#071018] bg-emerald-400" />
            </div>
          </div>
        </>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-space-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/60">
        <span>Product system</span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 backdrop-blur">
          Case study
        </span>
      </div>

      {technologies.length > 0 ? (
        <div className="absolute bottom-space-2 left-space-2 flex max-w-[calc(100%-2rem)] gap-space-1 overflow-hidden">
          <span className="whitespace-nowrap rounded-md border border-white/10 bg-black/35 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white/70 backdrop-blur">
            {technologies.length.toString().padStart(2, "0")} technologies
          </span>
        </div>
      ) : null}
    </div>
  );
}
