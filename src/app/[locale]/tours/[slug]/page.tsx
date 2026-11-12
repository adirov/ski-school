import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticle, getService, getTour, getTours, t, type Tour } from "@/lib/content";
import { abs, buildMetadata } from "@/lib/seo";
import { availableLocales, nonEmptyParams } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pic } from "@/components/Pic";
import { Badge, Todo } from "@/components/Badge";
import { LeadBlock } from "@/components/LeadBlock";
import { JsonLd } from "@/components/JsonLd";
import { img } from "@/lib/content";

type P = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return nonEmptyParams(publishedLocales.flatMap((locale) => getTours(locale).map((x) => ({ locale, slug: x.slug }))), { locale: "ru", slug: "_none" });
}

export async function generateMetadata({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const x = getTour(slug, locale);
  if (!x) return {};
  return buildMetadata({ locale, path: `/tours/${slug}/`, title: t(x.seo?.title, locale) || t(x.title, locale)!, description: t(x.seo?.description, locale) || t(x.summary, locale)!, available: availableLocales(`/tours/${slug}/`), image: x.images[0], noindex: x.status !== "confirmed" });
}

function Val({ v, todo, tbd }: { v: React.ReactNode | null | undefined; todo?: string | null; tbd: string }) {
  if (v != null && v !== "") return <>{v}</>;
  return (
    <>
      <span className="tbd">{tbd}</span>
      {todo && <Todo>{todo}</Todo>}
    </>
  );
}

function List({ items }: { items?: string[] }) {
  return items?.length ? (
    <ul className="ticks">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  ) : null;
}

function tourLd(x: Tour, locale: Locale) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t(x.title, locale),
    description: t(x.summary, locale),
    url: abs(`/${locale}/tours/${x.slug}/`),
    image: x.images.map((i) => abs(img(i).src)),
    provider: { "@id": abs("/#organization") },
  };
  // Price only when confirmed and visible on the page. No availability claims without a booking system.
  if (x.price.amount != null && x.price.unit) ld.offers = { "@type": "Offer", price: x.price.amount, priceCurrency: x.price.currency, url: abs(`/${locale}/tours/${x.slug}/`) };
  return ld;
}

export default async function TourPage({ params }: P) {
  const { locale: _l, slug } = await params;
  const locale = _l as Locale;
  const x = getTour(slug, locale);
  if (!x) notFound();
  const d = getDict(locale);
  const T = d.tour;
  const title = t(x.title, locale)!;
  const price =
    x.price.amount != null && x.price.unit
      ? `${new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(x.price.amount)} ${x.price.currency} ${x.price.unit === "person" ? T.perPerson : T.perGroup}`
      : null;
  const group = x.groupSize.min || x.groupSize.max ? `${x.groupSize.min ?? 1}–${x.groupSize.max ?? "?"}` : null;
  const related = x.relatedArticles.map((s) => getArticle(s, locale)).filter(Boolean);
  const relatedSvc = x.relatedServices.map((s) => getService(s, locale)).filter(Boolean);
  const others = getTours(locale).filter((o) => o.slug !== x.slug).slice(0, 2);

  const rows: [string, React.ReactNode][] = [
    [T.location, t(x.location, locale)],
    [T.route, <Val key="r" v={t(x.route.value, locale)} todo={x.route.todo} tbd={T.tbd} />],
    [T.duration, <Val key="d" v={t(x.duration.value, locale)} todo={x.duration.todo} tbd={T.tbd} />],
    [T.level, x.levels.map((l) => d.levels[l].name).join(", ")],
    [T.format, d.format[x.format]],
    [T.groupSize, <Val key="g" v={group} todo={x.groupSize.todo} tbd={T.tbd} />],
    [T.languages, <Val key="l" v={x.languages.value?.join(", ")} todo={x.languages.todo} tbd={T.tbd} />],
    [T.season, <Val key="s" v={t(x.season.value, locale)} todo={x.season.todo} tbd={T.tbd} />],
    [T.availability, T.availabilityRequest],
    [T.price, <Val key="p" v={price} todo={x.price.todo} tbd={T.priceOnRequest} />],
  ];

  const blocks: [string, React.ReactNode, string | null | undefined, boolean][] = [
    [T.included, <List key="i" items={t(x.included.value, locale)} />, x.included.todo, !!t(x.included.value, locale)?.length],
    [T.notIncluded, <List key="n" items={t(x.notIncluded.value, locale)} />, x.notIncluded.todo, !!t(x.notIncluded.value, locale)?.length],
    [T.meetingPoint, <p key="m">{t(x.meetingPoint.value, locale)}</p>, x.meetingPoint.todo, !!t(x.meetingPoint.value, locale)],
    [T.equipment, <List key="e" items={t(x.equipment.value, locale)} />, x.equipment.todo, !!t(x.equipment.value, locale)?.length],
    [T.restrictions, <List key="re" items={t(x.restrictions.value, locale)} />, x.restrictions.todo, !!t(x.restrictions.value, locale)?.length],
    [T.weather, <p key="w">{t(x.weatherPolicy.value, locale)}</p>, x.weatherPolicy.todo, !!t(x.weatherPolicy.value, locale)],
    [T.booking, <p key="b">{t(x.bookingTerms.value, locale)}</p>, x.bookingTerms.todo, !!t(x.bookingTerms.value, locale)],
  ];

  return (
    <div className="wrap page">
      {x.status === "confirmed" && <JsonLd data={tourLd(x, locale)} />}
      <Breadcrumbs
        label="Breadcrumbs"
        items={[
          { name: d.breadcrumbs.home, href: `/${locale}/` },
          { name: d.tours.h1, href: `/${locale}/tours/` },
          { name: title, href: `/${locale}/tours/${x.slug}/` },
        ]}
      />
      <header className="page__head">
        {x.status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
        <h1>{title}</h1>
        <p className="lead">{t(x.summary, locale)}</p>
        {x.status === "demo" && <p className="placeholder">{T.demoNote}</p>}
      </header>

      <div className="gallery">
        {x.images.map((id, i) => (
          <Pic key={id} id={id} locale={locale} sizes={i === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw"} priority={i === 0} alt={title} />
        ))}
      </div>

      <div className="detail">
        <div className="detail__main">
          {t(x.description, locale)!.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {blocks.map(([h, body, todo, has]) => (
            <section key={h} className="detail__block">
              <h2 className="h3">{h}</h2>
              {has ? body : <Val v={null} todo={todo} tbd={T.tbd} />}
            </section>
          ))}
          {x.faq.length > 0 && (
            <section className="detail__block">
              <h2 className="h3">FAQ</h2>
              <div className="faq">
                {x.faq.map((f, i) => (
                  <details key={i}>
                    <summary>{t(f.q, locale)}</summary>
                    <p>{t(f.a, locale)}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="detail__side" aria-label={T.facts}>
          <div className="factbox">
            <h2 className="h3">{T.facts}</h2>
            <dl>
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <a className="btn btn--accent btn--wide" href="#request" data-track="booking_click" data-track-item={x.slug}>
              {d.cta.requestAvailability}
            </a>
            <p className="small">{T.bookingNote}</p>
            {x.getYourGuideUrl && (
              <a className="btn btn--ghost btn--wide" href={x.getYourGuideUrl} target="_blank" rel="noopener sponsored" data-track="gyg_click" data-track-item={x.slug}>
                {T.gyg}
              </a>
            )}
          </div>
        </aside>
      </div>

      {(related.length > 0 || relatedSvc.length > 0 || others.length > 0) && (
        <section className="section section--tight">
          <h2 className="h3">{T.related}</h2>
          <ul className="links">
            {related.map((a) => (
              <li key={a!.slug}>
                <Link href={`/${locale}/guides/${a!.slug}/`}>{a!.title}</Link>
              </li>
            ))}
            {relatedSvc.map((s) => (
              <li key={s!.slug}>
                <Link href={`/${locale}/services/${s!.slug}/`}>{t(s!.title, locale)}</Link>
              </li>
            ))}
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/${locale}/tours/${o.slug}/`}>{t(o.title, locale)}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section form-wrap" id="request" aria-labelledby="req-h">
        <div>
          <h2 id="req-h">{d.cta.requestAvailability}</h2>
          <p>{T.bookingNote}</p>
        </div>
        <LeadBlock locale={locale} preselect={title} id="request-form" />
      </section>
    </div>
  );
}
