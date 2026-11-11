import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, getService, getServices, getTours, t } from "@/lib/content";
import { abs, buildMetadata } from "@/lib/seo";
import { availableLocales, nonEmptyParams } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pic } from "@/components/Pic";
import { Badge, Todo } from "@/components/Badge";
import { LeadBlock } from "@/components/LeadBlock";
import { JsonLd } from "@/components/JsonLd";
import { PartnerBlock } from "@/components/PartnerBlock";

type P = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return nonEmptyParams(publishedLocales.flatMap((locale) => getServices(locale).map((s) => ({ locale, slug: s.slug }))), { locale: "ru", slug: "_none" });
}

export async function generateMetadata({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const s = getService(slug, locale);
  if (!s) return {};
  return buildMetadata({
    locale,
    path: `/services/${slug}/`,
    title: t(s.seo?.title, locale) || `${t(s.title, locale)} ${locale === "ru" ? "в Алматы" : "in Almaty"}`,
    description: t(s.seo?.description, locale) || `${t(s.summary, locale)} ${getDict(locale).seo.serviceSuffix}`,
    available: availableLocales(`/services/${slug}/`),
    image: s.image,
    noindex: s.status !== "confirmed",
  });
}

export default async function ServicePage({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const s = getService(slug, locale);
  if (!s) notFound();
  const d = getDict(locale);
  const title = t(s.title, locale)!;
  const tours = getTours(locale).filter((x) => x.relatedServices.includes(s.slug));
  const articles = getArticles(locale).filter((a) => a.relatedServices.includes(s.slug));
  return (
    <div className="wrap page">
      {s.status === "confirmed" && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: title, description: t(s.summary, locale), url: abs(`/${locale}/services/${s.slug}/`), provider: { "@id": abs("/#organization") }, serviceType: title, areaServed: { "@type": "City", name: locale === "ru" ? "Алматы" : "Almaty" }, audience: { "@type": "Audience", audienceType: s.levels.map((l) => d.levels[l].name).join(", ") }, offers: { "@type": "Offer", url: abs(`/${locale}/services/${s.slug}/`), availability: "https://schema.org/InStock" } }} />
      )}
      <Breadcrumbs
        label="Breadcrumbs"
        items={[
          { name: d.breadcrumbs.home, href: `/${locale}/` },
          { name: d.tours.h1, href: `/${locale}/tours/` },
          { name: title, href: `/${locale}/services/${s.slug}/` },
        ]}
      />
      <div className="split">
        <div>
          {s.status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
          <h1>{title}</h1>
          <p className="lead">{t(s.summary, locale)}</p>
          {t(s.body, locale)!.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <dl className="mini">
            <div>
              <dt>{d.tour.level}</dt>
              <dd>{s.levels.map((l) => d.levels[l].name).join(", ")}</dd>
            </div>
            <div>
              <dt>{d.tour.format}</dt>
              <dd>{d.format[s.format]}</dd>
            </div>
            {s.age && (
              <div>
                <dt>{d.tour.age}</dt>
                <dd>{t(s.age, locale)}</dd>
              </div>
            )}
            {s.duration && (
              <div>
                <dt>{d.tour.duration}</dt>
                <dd>{t(s.duration, locale)}</dd>
              </div>
            )}
            <div>
              <dt>{d.tour.price}</dt>
              <dd>{d.tour.priceOnRequest}</dd>
            </div>
          </dl>
          {s.todo.length > 0 && (
            <p>
              <Todo>{s.todo.join("; ")}</Todo>
            </p>
          )}
          {s.source && (
            <p className="small">
              <Todo>
                {d.tour.source}: {s.source}
              </Todo>
            </p>
          )}
          <div className="btns">
            <a className="btn btn--accent" href="#request" data-track="booking_click" data-track-item={s.slug}>
              {d.cta.request}
            </a>
            <Link className="btn btn--ghost" href={`/${locale}/contact/`}>
              {d.cta.ask}
            </Link>
          </div>
        </div>
        <Pic id={s.image} locale={locale} sizes="(max-width: 900px) 100vw, 45vw" priority className="split__img" alt={title} />
      </div>

      {(tours.length > 0 || articles.length > 0) && (
        <section className="section section--tight">
          <h2 className="h3">{d.tour.related}</h2>
          <ul className="links">
            {tours.map((x) => (
              <li key={x.slug}>
                <Link href={`/${locale}/tours/${x.slug}/`}>{t(x.title, locale)}</Link>
              </li>
            ))}
            {articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/${locale}/guides/${a.slug}/`}>{a.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section form-wrap" id="request" aria-labelledby="req-h">
        <div>
          <h2 id="req-h">{d.cta.request}</h2>
          <p>{d.tour.bookingNote}</p>
        </div>
        <LeadBlock locale={locale} preselect={title} id="request-form" />
      </section>

      <PartnerBlock locale={locale} compact />
    </div>
  );
}
