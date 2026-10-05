const GALLERY_PREFIX = "portfolio-gallery:";

/**
 * Decode the media value stored in the legacy `thumbnailUrl` column.
 *
 * A plain value remains a single-image project. Galleries use a namespaced JSON
 * payload, allowing existing databases to support multiple images without a
 * destructive schema migration.
 */
export function decodeProjectImages(value?: string | null): string[] {
  if (!value) return [];
  if (!value.startsWith(GALLERY_PREFIX)) return [value];

  try {
    const parsed: unknown = JSON.parse(value.slice(GALLERY_PREFIX.length));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0,
    );
  } catch {
    return [];
  }
}

/** Encode one or more project image URLs for persistence. */
export function encodeProjectImages(
  imageUrls: readonly string[],
): string | undefined {
  const normalized = imageUrls
    .map((url) => url.trim())
    .filter(
      (url, index, values) => url.length > 0 && values.indexOf(url) === index,
    );

  if (normalized.length === 0) return undefined;
  if (normalized.length === 1) return normalized[0];
  return `${GALLERY_PREFIX}${JSON.stringify(normalized)}`;
}
