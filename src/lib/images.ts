/**
 * Image helpers shared by the public site and the CMS.
 *
 * `next/image` resizes and re-encodes images (AVIF/WebP, responsive `srcset`,
 * lazy loading) for local files and our Vercel Blob store. Anything else —
 * SVGs, animated GIFs, or a pasted third-party URL — is served as-is.
 */

const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/i;

function pathOf(url: string): string {
  try {
    return new URL(url, "http://local").pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function isOptimizableImage(url: string | undefined | null): boolean {
  if (!url) return false;
  const path = pathOf(url);
  if (path.endsWith(".svg") || path.endsWith(".gif")) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    return BLOB_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Spread onto `<Image>`: `<Image {...imageSource(url)} … />`. */
export function imageSource(url: string): { src: string; unoptimized: boolean } {
  return { src: url, unoptimized: !isOptimizableImage(url) };
}

export function isVideoUrl(url: string | undefined | null): boolean {
  return !!url && /\.(mp4|webm|mov)$/i.test(pathOf(url));
}
