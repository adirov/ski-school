import type { Locale } from "@/i18n/config";
import { publishedLocales } from "@/i18n/config";
import { getArticles, getCategories, getPage, getServices, getTours, site } from "./content";

export type RouteEntry = { path: string; lastModified?: string; indexable: boolean };

/** Every page that exists for a locale (path after the locale). Single source for sitemap and language switch. */
export function routesFor(locale: Locale): RouteEntry[] {
  const r: RouteEntry[] = [
    { path: "/", indexable: true },
    // An empty catalog stays reachable (it explains how to ask) but is not indexed.
    { path: "/tours/", indexable: getTours(locale).length + getServices(locale).length > 0 },
    { path: "/faq/", indexable: true },
    { path: "/contact/", indexable: true },
    { path: "/thank-you/", indexable: false },
  ];
  // The guides section exists only when there is at least one visible article.
  if (getArticles(locale).length) r.push({ path: "/guides/", indexable: true }, { path: "/search/", indexable: false });
  if (getPage("about", locale)) r.push({ path: "/about/", indexable: true });
  for (const p of ["booking-terms", "privacy"]) if (getPage(p, locale)) r.push({ path: `/${p}/`, indexable: site.legal.approved });
  if (site.team.length) r.push({ path: "/team/", indexable: true });
  for (const t of getTours(locale)) r.push({ path: `/tours/${t.slug}/`, indexable: t.status === "confirmed" });
  for (const s of getServices(locale)) r.push({ path: `/services/${s.slug}/`, indexable: s.status === "confirmed" });
  for (const a of getArticles(locale)) r.push({ path: `/guides/${a.slug}/`, lastModified: a.updated, indexable: a.status === "published" });
  for (const c of getCategories(locale)) r.push({ path: `/guides/category/${c.key}/`, indexable: true });
  return r;
}

/** Locales in which a given path exists. Used for hreflang. */
export function availableLocales(path: string): Locale[] {
  return publishedLocales.filter((l) => routesFor(l).some((r) => r.path === path));
}

/**
 * `output: export` refuses a dynamic route with no params. When a collection is empty (e.g. no confirmed tours yet),
 * emit one placeholder that renders notFound(); scripts/build-pages.mjs deletes such pages from the export.
 */
export function nonEmptyParams<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length ? params : [placeholder];
}
