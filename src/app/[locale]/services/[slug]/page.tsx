import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, getService, getServices, getTours, img, t, priceGroupFor, priceLabel, prices } from "@/lib/content";
import { PriceTable } from "@/components/PriceTable";
import { abs, areaServedLd, buildMetadata, orgRef, priceOffersLd } from "@/lib/seo";
import { PlaceList } from "@/components/PlaceList";
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
  const pg = priceGroupFor(s.slug);
  const tours = getTours(locale).filter((x) => x.relatedServices.includes(s.slug));
  const articles = getArticles(locale).filter((a) => a.relatedServices.includes(s.slug));
  const S = d.service;
  const faq = s.faq.filter((f) => t(f.q, locale) && t(f.a, locale));
  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      description: t(s.seo?.description, locale) || t(s.summary, locale),
      url: abs(`/${locale}/services/${s.slug}/`),
      image: abs(img(s.image).src),
      provider: orgRef(locale),
      serviceType: title,
      areaServed: s.showPlaces ? areaServedLd(locale) : areaServedLd(locale)[0],
      ...(s.minAge ? { audience: { "@type": "PeopleAudience", suggestedMinAge: s.minAge } } : {}),
      ...(pg ? { offers: priceOffersLd(pg, locale) } : {}),
    },
  ];
  if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale, mainEntity: faq.map((f) => ({ "@type": "Question", name: t(f.q, locale), acceptedAnswer: { "@type": "Answer", text: t(f.a, locale) } })) });
  return (
    <div className="wrap page">
      {s.status === "confirmed" && <JsonLd data={ld} />}
      <Breadcrumbs
        label="Breadcrumbs"
        items={[
          { name: d.breadcrumbs.home, href: `/${locale}/` },
          { name: d.tours.crumb, href: `/${locale}/tours/` },
          { name: title, href: `/${locale}/services/${s.slug}/` },
        ]}
      />
      <div className="split">
        <div>
          {s.status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
          <h1>{t(s.h1, locale) || title}</h1>
          <p className="lead">{t(s.summary, locale)}</p>
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
              <dd>{pg ? <Link href={`/${locale}/prices/`}>{priceLabel(pg, locale)}</Link> : d.tour.priceOnRequest}</dd>
            </div>
          </dl>
          {t(s.bodyTitle, locale) && <h2>{t(s.bodyTitle, locale)}</h2>}
          {t(s.body, locale)!.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
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

      <div className="svc-more wrap--narrow">
        {pg && (
          <section aria-labelledby="svc-price-h">
            <h2 id="svc-price-h">{t(s.priceTitle, locale) || `${d.tour.price}: ${title}`}</h2>
            <PriceTable group={pg} locale={locale} headingLevel={3} />
            <p className="small">{t(prices.notIncluded, locale)}</p>
          </section>
        )}
        {s.showPlaces && <PlaceList locale={locale} title={S.placesTitle} lead={S.placesLead} />}
        {s.sections.map((sec, i) => (
          <section key={i}>
            <h2>{t(sec.title, locale)}</h2>
            {t(sec.body, locale)?.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {t(sec.list, locale) && (
              <ul className="ticks">
                {t(sec.list, locale)!.map((x, j) => (
                  <li key={j}>{x}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {faq.length > 0 && (
          <section aria-labelledby="svc-faq-h">
            <h2 id="svc-faq-h">{S.faqTitle}</h2>
            <div className="faq faq--open">
              {faq.map((f, i) => (
                <section key={i}>
                  <h3>{t(f.q, locale)}</h3>
                  <p>{t(f.a, locale)}</p>
                </section>
              ))}
            </div>
          </section>
        )}
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
