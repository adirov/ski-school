import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getPriceGroups, getService, getServices, priceGroupFor, prices, t } from "@/lib/content";
import { abs, areaServedLd, buildMetadata, orgId, orgRef, priceOffersLd } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PriceTable } from "@/components/PriceTable";
import { JsonLd } from "@/components/JsonLd";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const P = getDict(locale).prices;
  return buildMetadata({ locale, path: "/prices/", title: P.seoTitle, description: P.seoDescription, available: availableLocales("/prices/"), image: "snowboarders-gear-check" });
}

export default async function PricesPage({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const P = d.prices;
  const groups = getPriceGroups(locale);
  const date = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(prices.updated));
  // Services without a published price (kids, off-piste): listed with "price on request", no Offer.
  const other = getServices(locale).filter((s) => !priceGroupFor(s.slug));
  const url = abs(`/${locale}/prices/`);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: P.h1,
      url,
      inLanguage: locale,
      dateModified: prices.updated,
      about: orgRef(locale),
      mainEntity: {
        "@type": "OfferCatalog",
        name: P.h1,
        url,
        itemListElement: groups.map((g) => {
          const s = g.service ? getService(g.service, locale) : undefined;
          return {
            "@type": "Service",
            name: s ? t(s.title, locale) : t(g.title, locale),
            ...(s ? { url: abs(`/${locale}/services/${s.slug}/`) } : {}),
            provider: orgId(),
            areaServed: areaServedLd(locale),
            offers: priceOffersLd(g, locale),
          };
        }),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: P.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
  return (
    <div className="wrap page wrap--narrow">
      <JsonLd data={ld} />
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: P.crumb, href: `/${locale}/prices/` }]} />
      <h1>{P.h1}</h1>
      <p className="lead">{P.lead}</p>
      <p>{P.summary}</p>
      {groups.map((g) => (
        <PriceTable key={g.key} group={g} locale={locale} />
      ))}
      <div className="price__excl">
        <h2 className="h3">{P.notInPrice}</h2>
        <p>{t(prices.notIncluded, locale)}</p>
      </div>
      <p className="small">
        {P.updated} {date.replace(/\.$/, "")}.
      </p>
      {other.length > 0 && (
        <section className="price" aria-labelledby="price-other">
          <h2 id="price-other" className="h3">
            {P.otherTitle}
          </h2>
          <p className="price__note">{P.otherLead}</p>
          <ul className="links">
            {other.map((s) => (
              <li key={s.slug}>
                <Link href={`/${locale}/services/${s.slug}/`}>{t(s.title, locale)}</Link>
                {s.duration && <> · {t(s.duration, locale)}</>}
                {s.age && <> · {t(s.age, locale)}</>} · {d.tour.priceOnRequest}
              </li>
            ))}
          </ul>
        </section>
      )}
      <h2 className="h3">{P.howTitle}</h2>
      <p>{P.how}</p>
      <div className="btns">
        <Link className="btn btn--accent" href={`/${locale}/contact/`} data-track="booking_click" data-track-item="prices">
          {d.cta.request}
        </Link>
      </div>
      <h2 className="h3" style={{ marginTop: 40 }}>{P.faqTitle}</h2>
      <div className="faq faq--open">
        {P.faq.map(([q, a]) => (
          <section key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </section>
        ))}
      </div>
      <h2 className="h3" style={{ marginTop: 40 }}>{P.servicesTitle}</h2>
      <ul className="links">
        {groups
          .map((g) => (g.service ? getService(g.service, locale) : undefined))
          .filter((s) => !!s)
          .map((s) => (
            <li key={s!.slug}>
              <Link href={`/${locale}/services/${s!.slug}/`}>{t(s!.title, locale)}</Link>
            </li>
          ))}
        <li>
          <Link href={`/${locale}/tours/`}>{d.nav.tours}</Link>
        </li>
      </ul>
    </div>
  );
}
