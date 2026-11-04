import { readFileSync } from "node:fs";

/** Slug changes: add {"source": "/ru/tours/old-slug/", "destination": "/ru/tours/new-slug/"} to content/redirects.json. */
const slugRedirects = JSON.parse(readFileSync(new URL("./content/redirects.json", import.meta.url), "utf8"));

/** GitHub Pages build (npm run build:pages): static files only, served under a sub-path. */
const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { globalNotFound: true },
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [480, 640, 828, 1080, 1280, 1600, 2048] },
};

if (STATIC_EXPORT) {
  // No server: redirects and headers are written as static files by scripts/build-pages.mjs.
  Object.assign(nextConfig, { output: "export", basePath, images: { unoptimized: true } });
} else {
  nextConfig.redirects = async () => [
    // Language root. Temporary, so the default can change later without cached 301s.
    { source: "/", destination: "/ru/", permanent: false },
    ...slugRedirects.map((r) => ({ source: r.source, destination: r.destination, permanent: true })),
  ];
  nextConfig.headers = async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
  ];
}

export default nextConfig;
