import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, getCategories } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PostList } from "@/components/PostList";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/guides/", title: d.guides.h1, description: d.guides.lead, available: availableLocales("/guides/"), image: "trans-ili-alatau-panorama" });
}

export default async function GuidesPage({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const articles = getArticles(locale);
  if (!articles.length) notFound();
  const cats = getCategories(locale);
  return (
    <div className="wrap page">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: d.guides.h1, href: `/${locale}/guides/` }]} />
      <header className="page__head">
        <h1>{d.guides.h1}</h1>
        <p className="lead">{d.guides.lead}</p>
      </header>
      <div className="guides-tools">
        {cats.length > 0 && (
          <nav aria-label={d.guides.categories} className="cats">
            <ul>
              <li><span aria-current="page">{d.guides.all}</span></li>
              {cats.map((c) => (
                <li key={c.key}><Link href={`/${locale}/guides/category/${c.key}/`}>{c.name}</Link></li>
              ))}
            </ul>
          </nav>
        )}
        <form role="search" action={`/${locale}/search/`} method="get" className="search__form">
          <label htmlFor="gq" className="sr-only">{d.guides.search}</label>
          <input id="gq" name="q" type="search" placeholder={d.guides.searchPlaceholder} />
          <button className="btn btn--dark" type="submit">{d.guides.searchButton}</button>
        </form>
      </div>
      {articles.length ? <PostList locale={locale} articles={articles} /> : <p className="placeholder">{d.guides.empty}</p>}
    </div>
  );
}
