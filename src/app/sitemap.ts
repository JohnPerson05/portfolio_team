import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/features/blog";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedProjects } from "@/server/public/queries";

/** Sitemap of public pages — published projects and posts only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([
    getPublishedPosts(),
    getPublishedProjects(),
  ]);
  const now = new Date();
  const sectionRoutes = [
    "/about",
    "/projects",
    "/services",
    "/skills",
    "/experience",
    "/testimonials",
    "/contact",
  ];

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...sectionRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/projects" ? 0.9 : 0.7,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
