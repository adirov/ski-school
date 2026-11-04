import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, getCategories } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales, nonEmptyParams } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PostList } from "@/components/PostList";

type P = { params: Promise<{ locale: string; category: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return nonEmptyParams(publishedLocales.flatMap((locale) => getCategories(locale).map((c) => ({ locale, category: c.key }))), { locale: "ru", category: "_none" });
}

export async function generateMetadata({ params }: P) {
  const { locale: _l, category } = await params;
  const locale = _l as Locale;
  const c = getCategories(locale).find((x) => x.key === category);
  if (!c) return {};
  const path = `/guides/category/${category}/`;
  return buildMetadata({ locale, path, title: c.name, description: c.description, available: availableLocales(path) });
}

export default async function CategoryPage({ params }: P) {
  const { locale: _l, category } = await params;
  const locale = _l as Locale;
  const d = getDict(locale);
  const cats = getCategories(locale);
  const c = cats.find((x) => x.key === category);
  if (!c) notFound();
  const articles = getArticles(locale).filter((a) => a.category === category);
  return (
    <div className="wrap page">
      <Breadcrumbs
        label="Breadcrumbs"
        items={[
          { name: d.breadcrumbs.home, href: `/${locale}/` },
          { name: d.guides.h1, href: `/${locale}/guides/` },
          { name: c.name, href: `/${locale}/guides/category/${c.key}/` },
        ]}
      />
      <header className="page__head">
        <h1>{c.name}</h1>
        <p className="lead">{c.description}</p>
      </header>
      <nav aria-label={d.guides.categories} className="cats">
        <ul>
          <li><Link href={`/${locale}/guides/`}>{d.guides.all}</Link></li>
          {cats.map((x) => (
            <li key={x.key}>{x.key === c.key ? <span aria-current="page">{x.name}</span> : <Link href={`/${locale}/guides/category/${x.key}/`}>{x.name}</Link>}</li>
          ))}
        </ul>
      </nav>
      <PostList locale={locale} articles={articles} />
    </div>
  );
}
