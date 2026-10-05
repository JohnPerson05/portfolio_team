"use client";

import Image from "next/image";

export interface HeroPortraitProps {
  /** Portrait image path/URL. */
  src: string;
  /** Accessible name for the portrait. */
  name: string;
}

/**
 * Homepage hero portrait — uses the owner's profile image as the dominant
 * visual on the right column of the first viewport.
 */
export function HeroPortrait({ src, name }: HeroPortraitProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,var(--accent-cool),transparent_68%)] opacity-[0.1] blur-2xl"
      />
      <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090b0e]/90 shadow-2xl shadow-black/50">
        <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
          <Image
            src={src}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 28rem"
            className="object-cover object-[center_12%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-transparent opacity-80"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#090b0e]/35 via-transparent to-transparent"
          />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-space-3 p-space-3 sm:p-space-4">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
              Portrait
            </p>
            <p className="mt-1 font-display text-body font-semibold text-text">
              {name}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-space-2 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-emerald-300 backdrop-blur">
            <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
