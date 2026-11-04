/** Public site origin, no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Content mode.
 * production (default): only confirmed services and published articles, no badges or TODO notes.
 * preview: internal review build. Demo offers, drafts and TODO notes are visible and every page is noindex.
 */
export const SITE_MODE: "preview" | "production" = process.env.NEXT_PUBLIC_SITE_MODE === "preview" ? "preview" : "production";
export const IS_PREVIEW = SITE_MODE === "preview";

/**
 * Indexing is a separate switch so a staging copy can show the real site and still stay out of search.
 * Pages are indexable only in production mode, with NEXT_PUBLIC_ALLOW_INDEXING=1 and a real public origin.
 */
const wantsIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "1";
const hasRealOrigin = /^https:\/\//.test(SITE_URL) && !/localhost|127\.0\.0\.1|example\.(com|org)/.test(SITE_URL);
if (wantsIndexing && !IS_PREVIEW && !hasRealOrigin) {
  throw new Error(`NEXT_PUBLIC_ALLOW_INDEXING=1 needs NEXT_PUBLIC_SITE_URL set to the public https origin (got "${SITE_URL}").`);
}
export const INDEXABLE = wantsIndexing && !IS_PREVIEW && hasRealOrigin;

export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "",
  yandex: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "",
};
export const ANALYTICS_ENABLED = Boolean(ANALYTICS.ga4 || ANALYTICS.yandex);

/** Static export (GitHub Pages): no server, so no API routes and no lead delivery. */
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
/** Sub-path the site is served from, e.g. "/almaty-snowboard" on GitHub Pages project sites. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
