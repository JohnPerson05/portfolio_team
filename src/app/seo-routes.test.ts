import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/blog", () => ({
  getPublishedPosts: vi.fn(),
}));
vi.mock("@/server/public/queries", () => ({
  getPublishedProjects: vi.fn(),
  getTeamMembers: vi.fn(),
}));

import { getPublishedPosts } from "@/features/blog";
import {
  getPublishedProjects as getProjects,
  getTeamMembers,
} from "@/server/public/queries";
import robots from "./robots";
import sitemap from "./sitemap";

const mockedGetPublishedPosts = getPublishedPosts as unknown as ReturnType<
  typeof vi.fn
>;
const mockedGetProjects = getProjects as unknown as ReturnType<typeof vi.fn>;
const mockedGetTeamMembers = getTeamMembers as unknown as ReturnType<
  typeof vi.fn
>;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example";
});

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("search-engine routes", () => {
  it("includes static pages, published posts, and team profiles in the sitemap", async () => {
    mockedGetPublishedPosts.mockResolvedValueOnce([
      {
        id: "post-1",
        title: "Published",
        slug: "published",
        excerpt: "Excerpt",
        content: "Content",
        publishedAt: "2026-08-01T00:00:00.000Z",
      },
    ]);
    mockedGetProjects.mockResolvedValueOnce([
      { slug: "petcury", updatedAt: "2026-09-01T00:00:00.000Z" },
    ]);
    mockedGetTeamMembers.mockResolvedValueOnce([{ slug: "leyahn-mallorca" }]);

    const entries = await sitemap();
    expect(entries.map(({ url }) => url)).toEqual([
      "https://portfolio.example/",
      "https://portfolio.example/blog",
      "https://portfolio.example/about",
      "https://portfolio.example/projects",
      "https://portfolio.example/services",
      "https://portfolio.example/skills",
      "https://portfolio.example/experience",
      "https://portfolio.example/testimonials",
      "https://portfolio.example/contact",
      "https://portfolio.example/projects/petcury",
      "https://portfolio.example/team/leyahn-mallorca",
      "https://portfolio.example/blog/published",
    ]);
  });

  it("allows public crawling and blocks admin routes", () => {
    expect(robots()).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
      sitemap: "https://portfolio.example/sitemap.xml",
    });
  });
});
