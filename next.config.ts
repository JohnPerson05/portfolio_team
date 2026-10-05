import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Only optimize images from our own storage. Other external URLs render
    // unoptimized (see `src/lib/images.ts`) so the optimizer can't be used as
    // an open image proxy.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/work/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Dev-only local uploads: never let an uploaded file run script.
        source: "/uploads/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; media-src 'self'",
          },
        ],
      },
      {
        source: "/admin/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
