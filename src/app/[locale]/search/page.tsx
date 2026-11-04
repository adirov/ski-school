import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticles } from "@/lib/content";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideSearch } from "@/components/GuideSearch";

type P = { params: Promise<{ locale: string }> };

/** Internal search results: noindex, follow (not blocked in robots.txt so the noindex is read). */
export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/search/", title: d.guides.search, description: d.guides.lead, available: availableLocales("/search/"), noindex: true });
}

export default async function SearchPage({ params }: P) {
  const locale = (await params).locale as Locale;
  if (!getArticles(locale).length) notFound();
  const d = getDict(locale);
  const G = d.guides;
  return (
    <div className="wrap page wrap--narrow">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: G.h1, href: `/${locale}/guides/` }, { name: G.search, href: `/${locale}/search/` }]} />
      <h1>{G.search}</h1>
      <Suspense>
        <GuideSearch locale={locale} labels={{ search: G.search, placeholder: G.searchPlaceholder, button: G.searchButton, results: G.results, noResults: G.noResults }} />
      </Suspense>
    </div>
  );
}
