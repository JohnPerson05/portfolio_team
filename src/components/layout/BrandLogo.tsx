import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_SRC, BRAND_NAME } from "./navigation";

export interface BrandLogoProps {
  /** Pixel size for the square mark. Defaults to 40 (navbar height fit). */
  size?: number;
  className?: string;
  /** Optional priority for above-the-fold placements (navbar). */
  priority?: boolean;
}

/**
 * Shared brand mark for the public shell and admin nav.
 */
export function BrandLogo({
  size = 40,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt={BRAND_NAME}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "rounded-md object-cover",
        className,
      )}
    />
  );
}
