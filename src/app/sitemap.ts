export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { LOCALES, X_DEFAULT_LOCALE, publishedLocales } from "@/i18n/config";
import { IS_PREVIEW, SITE_URL } from "@/lib/env";
import { availableLocales, routesFor } from "@/lib/routes";

/** Only canonical, indexable pages of published locales. Empty in preview mode (everything is noindex there). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (IS_PREVIEW) return [];
  const out: MetadataRoute.Sitemap = [];
  for (const locale of publishedLocales) {
    for (const r of routesFor(locale)) {
      if (!r.indexable) continue;
      const langs = availableLocales(r.path);
      const languages =
        langs.length > 1
          ? Object.fromEntries([
              ...langs.map((l) => [LOCALES[l].htmlLang, `${SITE_URL}/${l}${r.path}`]),
              ["x-default", `${SITE_URL}/${langs.includes(X_DEFAULT_LOCALE) ? X_DEFAULT_LOCALE : langs[0]}${r.path}`],
            ])
          : undefined;
      out.push({ url: `${SITE_URL}/${locale}${r.path}`, lastModified: r.lastModified, alternates: languages ? { languages } : undefined });
    }
  }
  return out;
}
