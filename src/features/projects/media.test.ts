import { describe, expect, it } from "vitest";

import { decodeProjectImages, encodeProjectImages } from "./media";

describe("project media persistence", () => {
  it("keeps a single image backward-compatible", () => {
    const encoded = encodeProjectImages(["https://example.com/cover.webp"]);
    expect(encoded).toBe("https://example.com/cover.webp");
    expect(decodeProjectImages(encoded)).toEqual([
      "https://example.com/cover.webp",
    ]);
  });

  it("round-trips an ordered gallery without duplicates", () => {
    const encoded = encodeProjectImages([
      "https://example.com/cover.webp",
      "https://example.com/detail.webp",
      "https://example.com/cover.webp",
    ]);

    expect(decodeProjectImages(encoded)).toEqual([
      "https://example.com/cover.webp",
      "https://example.com/detail.webp",
    ]);
  });

  it("handles absent and malformed gallery values safely", () => {
    expect(decodeProjectImages(null)).toEqual([]);
    expect(decodeProjectImages("portfolio-gallery:not-json")).toEqual([]);
  });
});
