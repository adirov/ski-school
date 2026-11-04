import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, getFaq, getServices, getTours, site, factVisible, places, t } from "@/lib/content";
import { buildMetadata, organizationLd, websiteLd } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { IS_PREVIEW } from "@/lib/env";
import { Pic } from "@/components/Pic";
import { OfferCard } from "@/components/OfferCard";
import { LeadBlock } from "@/components/LeadBlock";
import { JsonLd } from "@/components/JsonLd";
import { Badge, Todo } from "@/components/Badge";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({
    locale,
    path: "/",
    title: locale === "ru" ? "Almaty Snowboard — сноуборд в горах Алматы" : "Almaty Snowboard — snowboarding in the mountains of Almaty",
    description: d.home.lead,
    available: availableLocales("/"),
    image: "snowboarder-powder-spray",
  });
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function Home({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const H = d.home;
  const T = d.tour;
  const services = getServices(locale);
  const tours = getTours(locale);
  const articles = getArticles(locale).slice(0, 3);
  const faq = getFaq(locale).slice(0, 5);
  const creds = [site.brand.foundedNote, site.brand.credentialsNote].filter(factVisible);
  const showPlaces = site.placesConfirmed || IS_PREVIEW;
  const phone = site.contacts.phone;
  const person = site.contacts.person;
  const offpiste = services.find((s) => s.slug === "off-piste-guiding");
  const [h1a, h1em, h1b] = H.h1Parts;
  const pv = person.value as unknown;
  const personName = typeof pv === "string" ? pv : (pv as Record<string, string> | null)?.[locale] ?? (pv as Record<string, string> | null)?.ru;

  return (
    <>
      <JsonLd data={[organizationLd(locale), websiteLd(locale)]} />

      <section className="hero">
        <Pic id="snowboarder-powder-spray" locale={locale} sizes="100vw" priority className="hero__img" />
        <div className="wrap hero__body">
          <p className="label">{H.eyebrow}</p>
          <h1>
            <span>{h1a}</span> <em>{h1em}</em> <span>{h1b}</span>
          </h1>
          {creds.length > 0 && (
            <ul className="creds">
              {creds.map((c, i) => (
                <li key={i}>
                  {c.value[locale] ?? c.value.ru}
                  {!c.confirmed && <Todo>{c.todo}</Todo>}
                </li>
              ))}
            </ul>
          )}
          <p className="hero__lead">{H.lead}</p>
          <div className="btns">
            <Link className="btn btn--accent" href={`/${locale}/tours/`}>
              {d.cta.pick}
            </Link>
            <a className="btn btn--yellow" href="#lead">
              {d.cta.request}
            </a>
            <Link className="btn btn--ghost" href={`/${locale}/contact/`}>
              {d.cta.ask}
            </Link>
          </div>
        </div>
        {showPlaces && (
          <div className="hero__meta">
            <div className="wrap">
              {places.map((pl) => (
                <span key={pl.image}>{t(pl.name, locale)}</span>
              ))}
              {!site.placesConfirmed && <Todo>{site.serviceArea.todo}</Todo>}
            </div>
          </div>
        )}
      </section>
      <div className="stripe" aria-hidden="true" />

      {services.length > 0 && (
        <section className="idx" aria-labelledby="idx-h">
          <div className="wrap">
            <div className="idx__head">
              <h2 id="idx-h">{services.length === 4 ? H.idxTitle : d.tours.services}</h2>
              <p>{H.idxLead}</p>
            </div>
            <div className={`tiles tiles--${Math.min(services.length, 4)}`}>
              {services.map((s, i) => (
                <Link key={s.slug} className="tile" href={`#svc-${s.slug}`}>
                  <Pic id={s.image} locale={locale} sizes="(max-width: 1080px) 50vw, 300px" decorative />
                  {s.status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
                  <span className="tile__txt">
                    <span className="label">{d.format[s.format]}</span>
                    <span className="tile__h">{t(s.title, locale)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {services.map((s, i) => (
        <section key={s.slug} id={`svc-${s.slug}`} className={`prog${i % 2 ? " prog--flip" : ""}`} aria-labelledby={`svc-${s.slug}-h`}>
          <div className="wrap prog__grid">
            <div className="prog__media">
              <Pic id={s.image} locale={locale} sizes="(max-width: 820px) 100vw, 55vw" />
            </div>
            <div className="prog__txt">
              <p className="label">
                {pad(i + 1)} · {d.format[s.format]}
              </p>
              {s.status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
              <h2 id={`svc-${s.slug}-h`}>{t(s.title, locale)}</h2>
              <p>{t(s.summary, locale)}</p>
              <ul className="facts">
                <li>
                  <span>{T.level}</span>
                  <span>{s.levels.map((l) => d.levels[l].name).join(", ")}</span>
                </li>
                <li>
                  <span>{T.format}</span>
                  <span>{d.format[s.format]}</span>
                </li>
                <li>
                  <span>{T.duration}</span>
                  <span className="tbd">{T.tbd}</span>
                </li>
                <li>
                  <span>{T.price}</span>
                  <span className="tbd">{T.priceOnRequest}</span>
                </li>
              </ul>
              <div className="btns">
                <a className="btn btn--yellow" href="#lead">
                  {d.cta.request}
                </a>
                <Link className="btn btn--ghost" href={`/${locale}/services/${s.slug}/`}>
                  {H.progMore}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      {offpiste && (
        <section className="wide" aria-labelledby="wide-h">
          <Pic id="heliski-landing-group" locale={locale} sizes="100vw" decorative />
          <div className="wrap">
            <p className="label">{H.wideLabel}</p>
            <h2 id="wide-h">{H.wideTitle}</h2>
            <p>{H.wideText}</p>
            <div>
              <Link className="btn btn--accent" href={`/${locale}/services/${offpiste.slug}/`}>
                {H.wideCta}
              </Link>
            </div>
          </div>
        </section>
      )}

      {tours.length > 0 && (
        <section className="section" aria-labelledby="offers-h">
          <div className="wrap">
            <div className="section__head">
              <h2 id="offers-h">{H.offersTitle}</h2>
              <Link className="link-arrow" href={`/${locale}/tours/`}>
                {d.cta.all}
              </Link>
              <p>{H.offersLead}</p>
            </div>
            <div className="grid grid--3">
              {tours.slice(0, 3).map((x) => (
                <OfferCard key={x.slug} locale={locale} href={`/${locale}/tours/${x.slug}/`} title={t(x.title, locale)!} summary={t(x.summary, locale)!} image={x.images[0]} levels={x.levels} status={x.status} kicker={t(x.location, locale)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="steps-sec" aria-labelledby="process-h">
        <div className="wrap">
          <h2 id="process-h">{H.processTitle}</h2>
          <ol className="steps">
            {H.process.map(([h, p]) => (
              <li key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {showPlaces && (
        <section className="places" aria-labelledby="places-h">
          <div className="wrap">
            <h2 id="places-h">{H.placesTitle}</h2>
            {!site.placesConfirmed && <Todo>{site.serviceArea.todo}</Todo>}
            <div className="places__grid">
              {places.map((pl) => (
                <article key={pl.image} className="place">
                  <Pic id={pl.image} locale={locale} sizes="(max-width: 820px) 100vw, 400px" />
                  <h3>{t(pl.name, locale)}</h3>
                  <p>{t(pl.text, locale)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {site.team.length > 0 ? (
        <section className="section section--alt">
          <div className="wrap">
            <h2>{H.teamTitle}</h2>
            <Link href={`/${locale}/team/`}>{d.cta.readMore}</Link>
          </div>
        </section>
      ) : null}

      {IS_PREVIEW && (
        <section className="rev">
          <div className="wrap">
            <div className="rev__box">
              <h3>{H.reviewsTitle}</h3>
              <p>{H.reviewsText}</p>
              {site.team.length === 0 && (
                <p>
                  <b>{H.teamTitle}.</b> <Todo>{site.teamTodo}</Todo>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="section section--alt" aria-labelledby="guides-h">
          <div className="wrap">
            <div className="section__head">
              <h2 id="guides-h">{H.guidesTitle}</h2>
              <Link className="link-arrow" href={`/${locale}/guides/`}>
                {d.cta.all}
              </Link>
            </div>
            <div className="grid grid--3">
              {articles.map((a) => (
                <article key={a.slug} className="post">
                  <Link href={`/${locale}/guides/${a.slug}/`} className="post__media" tabIndex={-1} aria-hidden="true">
                    <Pic id={a.cover} locale={locale} sizes="(max-width: 640px) 100vw, 400px" decorative />
                  </Link>
                  <h3>
                    <Link href={`/${locale}/guides/${a.slug}/`}>{a.title}</Link>
                  </h3>
                  <p>{a.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="section" aria-labelledby="faq-h">
          <div className="wrap wrap--narrow">
            <h2 id="faq-h">{H.faqTitle}</h2>
            <div className="faq">
              {faq.map((f, i) => (
                <details key={i}>
                  <summary>{t(f.q, locale)}</summary>
                  <p>{t(f.a, locale)}</p>
                </details>
              ))}
            </div>
            <Link className="link-arrow" href={`/${locale}/faq/`}>
              {d.cta.all}
            </Link>
          </div>
        </section>
      )}

      <section className="book" id="lead" aria-labelledby="lead-h">
        <Pic id="kosmostantsiya-freeride-slopes" locale={locale} sizes="100vw" decorative className="book__bg" />
        <div className="wrap form-wrap">
          <div className="book__info">
            <h2 id="lead-h">{H.formTitle}</h2>
            <p>{H.formLead}</p>
            <span className="rule" aria-hidden="true" />
            {(factVisible(person) || factVisible(phone)) && (
              <div className="person">
                <span className="person__ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                  </svg>
                </span>
                <span>
                  {factVisible(person) && <b>{personName}</b>}
                  {factVisible(phone) && (
                    <a href={`tel:${phone.value}`} data-track="phone_click">
                      {phone.display}
                    </a>
                  )}
                  {(!person.confirmed || !phone.confirmed) && <Todo>{phone.todo}</Todo>}
                </span>
              </div>
            )}
          </div>
          <LeadBlock locale={locale} />
        </div>
      </section>
    </>
  );
}
