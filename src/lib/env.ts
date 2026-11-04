/** Public site origin, no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * preview: demo offers and draft articles are visible with badges, every page is noindex.
 * production: only confirmed/published content, indexing allowed.
 */
export const SITE_MODE: "preview" | "production" = process.env.NEXT_PUBLIC_SITE_MODE === "production" ? "production" : "preview";
export const IS_PREVIEW = SITE_MODE === "preview";

export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "",
  yandex: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "",
};
export const ANALYTICS_ENABLED = Boolean(ANALYTICS.ga4 || ANALYTICS.yandex);

/** Static export (GitHub Pages): no server, so no API routes and no lead delivery. */
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
/** Sub-path the site is served from, e.g. "/almaty-snowboard" on GitHub Pages project sites. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
