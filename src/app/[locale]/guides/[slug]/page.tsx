import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { categories, getArticle, getArticles, getService, getTour, img, site, t } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { abs, buildMetadata } from "@/lib/seo";
import { availableLocales, nonEmptyParams } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pic } from "@/components/Pic";
import { Prose } from "@/components/Prose";
import { Badge, Todo } from "@/components/Badge";
import { JsonLd } from "@/components/JsonLd";
import { IS_PREVIEW } from "@/lib/env";

type P = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return nonEmptyParams(publishedLocales.flatMap((locale) => getArticles(locale).map((a) => ({ locale, slug: a.slug }))), { locale: "ru", slug: "_none" });
}

export async function generateMetadata({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const a = getArticle(slug, locale);
  if (!a) return {};
  return buildMetadata({
    locale,
    path: `/guides/${slug}/`,
    title: a.title,
    description: a.description,
    available: availableLocales(`/guides/${slug}/`),
    image: a.cover,
    type: "article",
    publishedTime: a.published,
    modifiedTime: a.updated,
    noindex: a.status !== "published",
  });
}

const fmt = (iso: string, locale: Locale) => new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export default async function ArticlePage({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const a = getArticle(slug, locale);
  if (!a) notFound();
  const d = getDict(locale);
  const G = d.guides;
  const { html, toc } = renderMarkdown(a.body);
  const cat = categories[a.category]?.[locale];
  const related = a.relatedArticles.map((s) => getArticle(s, locale)).filter(Boolean);
  const offers = [
    ...a.relatedServices.map((s) => getService(s, locale)).filter(Boolean).map((s) => ({ href: `/${locale}/services/${s!.slug}/`, title: t(s!.title, locale)! })),
    ...a.relatedTours.map((s) => getTour(s, locale)).filter(Boolean).map((x) => ({ href: `/${locale}/tours/${x!.slug}/`, title: t(x!.title, locale)! })),
  ];
  const url = abs(`/${locale}/guides/${a.slug}/`);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    image: abs(img(a.cover).src),
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: LOCALES[locale].htmlLang,
    mainEntityOfPage: url,
    author: a.author ? { "@type": "Organization", name: site.brand.name } : undefined,
    publisher: { "@id": abs("/#organization") },
  };
  return (
    <div className="wrap page">
      <JsonLd data={ld} />
      <Breadcrumbs
        label="Breadcrumbs"
        items={[
          { name: d.breadcrumbs.home, href: `/${locale}/` },
          { name: G.h1, href: `/${locale}/guides/` },
          ...(cat ? [{ name: cat.name, href: `/${locale}/guides/category/${a.category}/` }] : []),
          { name: a.title, href: `/${locale}/guides/${a.slug}/` },
        ]}
      />
      <article className="article">
        <header className="article__head">
          {a.status === "draft" && <Badge kind="draft">{d.badge.draft}</Badge>}
          <h1>{a.title}</h1>
          <p className="lead">{a.description}</p>
          <dl className="byline">
            {a.author && (
              <div>
                <dt>{G.author}</dt>
                <dd>{a.author}</dd>
              </div>
            )}
            {a.reviewer ? (
              <div>
                <dt>{G.reviewer}</dt>
                <dd>{a.reviewer}</dd>
              </div>
            ) : null}
            <div>
              <dt>{G.published}</dt>
              <dd>
                <time dateTime={a.published}>{fmt(a.published, locale)}</time>
              </dd>
            </div>
            <div>
              <dt>{G.updated}</dt>
              <dd>
                <time dateTime={a.updated}>{fmt(a.updated, locale)}</time>
              </dd>
            </div>
          </dl>
          {a.todo.length > 0 && <Todo>{a.todo.join(" ")}</Todo>}
        </header>

        <Pic id={a.cover} locale={locale} sizes="(max-width: 900px) 100vw, 900px" priority className="article__cover" />

        <div className="article__grid">
          {toc.length > 2 && (
            <nav className="toc" aria-labelledby="toc-h">
              <h2 id="toc-h" className="kicker">{G.toc}</h2>
              <ol>
                {toc.map((i) => (
                  <li key={i.id} className={i.depth === 3 ? "toc__sub" : undefined}>
                    <a href={`#${i.id}`}>{i.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="article__body">
            <aside className="answer" aria-label={G.answer}>
              <p className="kicker">{G.answer}</p>
              <p>{a.answer}</p>
            </aside>
            <Prose html={html} />

            {a.sources.length > 0 && (
              <section className="sources" aria-labelledby="src-h">
                <h2 id="src-h" className="h3">{G.sources}</h2>
                <ul>
                  {a.sources.map((s) => (
                    <li key={s.title}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}{" "}
                      {s.checked ? <span className="small">({G.sourceChecked} {s.checked})</span> : IS_PREVIEW ? <span className="small">({G.sourceUnchecked})</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {offers.length > 0 && (
              <section className="related" aria-labelledby="rel-s">
                <h2 id="rel-s" className="h3">{G.relatedServices}</h2>
                <ul className="links">
                  {offers.map((o) => (
                    <li key={o.href}>
                      <Link href={o.href}>{o.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {related.length > 0 && (
              <section className="related" aria-labelledby="rel-a">
                <h2 id="rel-a" className="h3">{G.related}</h2>
                <ul className="links">
                  {related.map((r) => (
                    <li key={r!.slug}>
                      <Link href={`/${locale}/guides/${r!.slug}/`}>{r!.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
