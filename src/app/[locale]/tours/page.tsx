import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getServices, getTours, t } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OfferCard } from "@/components/OfferCard";
import { LevelFilter } from "@/components/LevelFilter";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const empty = getServices(locale).length + getTours(locale).length === 0;
  return buildMetadata({ locale, path: "/tours/", title: d.tours.h1, description: d.tours.lead, available: availableLocales("/tours/"), image: "kosmostantsiya-freeride-slopes", noindex: empty });
}

export default async function ToursPage({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const services = getServices(locale);
  const tours = getTours(locale);
  const levels = (["beginner", "intermediate", "advanced"] as const).map((k) => ({ key: k, name: d.levels[k].name }));
  return (
    <div className="wrap page">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: d.tours.crumb, href: `/${locale}/tours/` }]} />
      <header className="page__head">
        <h1>{d.tours.h1}</h1>
        <p className="lead">{d.tours.lead}</p>
      </header>
      {services.length + tours.length === 0 ? (
        <p className="placeholder">
          {d.tours.emptyCatalog} <Link href={`/${locale}/contact/`}>{d.cta.ask}</Link>
        </p>
      ) : (
        <LevelFilter label={d.tours.filterLevel} allLabel={d.tours.filterAll} levels={levels} emptyText={d.tours.empty}>
          {services.length > 0 && (
            <section aria-labelledby="svc-h" className="cat-block">
              <h2 id="svc-h">{d.tours.services}</h2>
              <div className="grid grid--4">
                {services.map((s, i) => (
                  <OfferCard priority={i < 2} key={s.slug} locale={locale} href={`/${locale}/services/${s.slug}/`} title={t(s.title, locale)!} summary={t(s.summary, locale)!} image={s.image} levels={s.levels} status={s.status} />
                ))}
              </div>
            </section>
          )}
          {tours.length > 0 && (
            <section aria-labelledby="tours-h" className="cat-block">
              <h2 id="tours-h">{d.tours.tours}</h2>
              <div className="grid grid--3">
                {tours.map((x) => (
                  <OfferCard key={x.slug} locale={locale} href={`/${locale}/tours/${x.slug}/`} title={t(x.title, locale)!} summary={t(x.summary, locale)!} image={x.images[0]} levels={x.levels} status={x.status} kicker={t(x.location, locale)} />
                ))}
              </div>
            </section>
          )}
        </LevelFilter>
      )}
      {services.length > 1 && (
        <section aria-labelledby="cmp-h" className="section section--tight prose">
          <h2 id="cmp-h">{d.tours.compareTitle}</h2>
          <div className="table-wrap cmp">
            <table>
              <thead>
                <tr>
                  {d.tours.compareCols.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.slug}>
                    <th scope="row">
                      <Link href={`/${locale}/services/${s.slug}/`}>{t(s.shortTitle, locale) ?? t(s.title, locale)}</Link>
                    </th>
                    <td data-label={d.tours.compareCols[1]}>{s.levels.map((l) => d.levels[l].name).join(", ")}</td>
                    <td data-label={d.tours.compareCols[2]}>{d.format[s.format]}</td>
                    <td data-label={d.tours.compareCols[3]}>{t(s.duration, locale) ?? "—"}</td>
                    <td data-label={d.tours.compareCols[4]}>{t(s.age, locale) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>{d.tours.chooseTitle}</h2>
          <ul>
            {d.tours.choose.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>
            {d.tours.priceNote} <Link href={`/${locale}/contact/`}>{d.cta.ask}</Link>
          </p>
        </section>
      )}
    </div>
  );
}
