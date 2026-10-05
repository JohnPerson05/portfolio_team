"use client";

import { useState } from "react";
import Image from "next/image";

interface ReferenceAvatarProps {
  url?: string;
  author: string;
  initials: string;
}

export function ReferenceAvatar({
  url,
  author,
  initials,
}: ReferenceAvatarProps) {
  const [imageAvailable, setImageAvailable] = useState(Boolean(url));

  if (!url || !imageAvailable) {
    return (
      <span
        aria-hidden="true"
        className="border-accent/25 bg-accent/[0.08] flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-display text-body font-semibold text-accent"
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={`Photo of ${author}`}
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-full border border-hairline object-cover"
      onError={() => setImageAvailable(false)}
    />
  );
}

interface ReferenceLogoProps {
  url: string;
  company?: string;
  author: string;
}

export function ReferenceLogo({ url, company, author }: ReferenceLogoProps) {
  const [imageAvailable, setImageAvailable] = useState(true);

  if (!imageAvailable) return null;

  return (
    <Image
      src={url}
      alt={company ? `${company} logo` : `${author} company logo`}
      width={96}
      height={32}
      className="ml-auto hidden h-8 w-auto shrink-0 object-contain opacity-70 sm:block"
      onError={() => setImageAvailable(false)}
    />
  );
}
