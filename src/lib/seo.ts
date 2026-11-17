import type { Metadata } from "next";
import { LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { INDEXABLE, SITE_URL } from "./env";
import { site, img, getServices, t, prices, places, fmtPrice, hoursLabel, minPrice, maxPrice, type PriceGroup } from "./content";

export const abs = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);

/** Path of the same page in another locale, e.g. ("en", "/tours/x/") -> "/en/tours/x/". */
export const localePath = (locale: Locale, rest = "/") => `/${locale}${rest === "/" ? "/" : rest}`;

type MetaInput = {
  locale: Locale;
  /** Path after the locale, starting and ending with "/". */
  path: string;
  title: string;
  description: string;
  /** Locales where this exact page exists (for hreflang). Must include `locale`. */
  available: Locale[];
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(m: MetaInput): Metadata {
  const url = abs(localePath(m.locale, m.path));
  const languages: Record<string, string> = {};
  // Reciprocal hreflang only between translations that really exist.
  if (m.available.length > 1) {
    for (const l of m.available) languages[LOCALES[l].htmlLang] = abs(localePath(l, m.path));
    const xd = m.available.includes(X_DEFAULT_LOCALE) ? X_DEFAULT_LOCALE : m.available[0];
    languages["x-default"] = abs(localePath(xd, m.path));
  }
  const image = img(m.image ?? "trans-ili-alatau-panorama");
  const noindex = !INDEXABLE || m.noindex;
  // The layout template appends " | <brand>". Long titles get cut in search results,
  // so keep the brand only when the whole title still fits about 60 characters.
  const withBrand = `${m.title} | ${site.brand.name}`;
  const title = m.title.includes(site.brand.name) || withBrand.length > 60 ? { absolute: m.title } : m.title;
  return {
    title,
    description: m.description,
    alternates: { canonical: url, languages: Object.keys(languages).length ? languages : undefined },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: m.type ?? "website",
      url,
      siteName: site.brand.name,
      title: m.title,
      description: m.description,
      locale: LOCALES[m.locale].ogLocale,
      images: [{ url: abs(image.src), width: image.width, height: image.height, alt: image.alt[m.locale] ?? "" }],
      ...(m.type === "article" ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [abs(image.src)] },
  };
}

/* ---------- JSON-LD builders (only confirmed, visible facts) ---------- */

/** The school's canonical URL: Russian is the main market, so the entity always points to /ru/ (English via WebSite.inLanguage). */
const ORG_URL = `${SITE_URL}/ru/`;
/** One entity everywhere: a local sports school. Sub-types of Organization, so Organization consumers still read it. */
const ORG_TYPE = ["SportsActivityLocation", "LocalBusiness"];

/** "25 000–130 000 ₸" / "25,000–130,000 KZT": lowest to highest published lesson price. */
function priceRange(locale: Locale) {
  if (!prices.groups.length) return undefined;
  const lo = Math.min(...prices.groups.map(minPrice));
  const hi = Math.max(...prices.groups.map(maxPrice));
  const [a, b] = [fmtPrice(lo, locale), fmtPrice(hi, locale)];
  return lo === hi ? a : `${a.replace(/\u00a0(₸|KZT)$/, "")}–${b}`;
}

/** Almaty plus the resorts where lessons take place (only when the owner confirmed them: site.placesConfirmed). */
export function areaServedLd(locale: Locale) {
  const city = { "@type": "City", name: locale === "ru" ? "Алматы" : "Almaty", containedInPlace: { "@type": "Country", name: locale === "ru" ? "Казахстан" : "Kazakhstan" } };
  if (!site.placesConfirmed) return [city];
  // No containedInPlace on resorts: most of them lie outside the city limits (Almaty region).
  return [city, ...places.map((p) => ({ "@type": "SkiResort", name: t(p.name, locale) }))];
}

export function organizationLd(locale: Locale) {
  const c = site.contacts;
  const sameAs = [c.instagram, c.telegram].filter((f) => f.confirmed && f.value).map((f) => f.value as string);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ORG_TYPE,
    "@id": `${SITE_URL}/#organization`,
    name: site.brand.name,
    url: ORG_URL,
    // Google wants a raster logo (min 112 px): PNG render of brand/logo.svg.
    logo: abs("/brand/logo-512.png"),
    image: abs("/brand/logo-512.png"),
    description: site.brand.shortDescription[locale] ?? site.brand.shortDescription.ru,
    alternateName: ["Almaty Snowboard", locale === "ru" ? "Школа сноуборда Алматы" : "Almaty snowboard school"],
    knowsAbout: locale === "ru" ? ["сноуборд", "обучение сноуборду", "фрирайд", "Заилийский Алатау"] : ["snowboarding", "snowboard lessons", "freeride", "Trans-Ili Alatau"],
    currenciesAccepted: prices.currency,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "ru" ? "Занятия по сноуборду" : "Snowboard lessons",
      itemListElement: getServices(locale)
        .filter((x) => x.status === "confirmed")
        .map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: t(x.title, locale), url: abs(`/${locale}/services/${x.slug}/`) } })),
    },
  };
  if (sameAs.length) ld.sameAs = sameAs;
  if (site.brand.foundedNote.confirmed) ld.foundingDate = "2005";
  const pr = priceRange(locale);
  if (pr) ld.priceRange = pr;
  if (c.phone.confirmed && c.phone.value) {
    ld.telephone = c.phone.value;
    ld.contactPoint = { "@type": "ContactPoint", telephone: c.phone.value, contactType: "customer service", availableLanguage: ["ru", "en"] };
  }
  // City only: the school works at the resorts around Almaty, there is no published office address.
  ld.address = { "@type": "PostalAddress", addressLocality: locale === "ru" ? "Алматы" : "Almaty", addressCountry: "KZ" };
  if (c.email.confirmed && c.email.value) ld.email = c.email.value;
  if (site.serviceArea.confirmed) ld.areaServed = areaServedLd(locale);
  return ld;
}

/** Compact node for provider/publisher/author: readable on its own, linked to the full node by @id. */
export function orgRef(_locale?: Locale) {
  const c = site.contacts;
  return {
    "@type": ORG_TYPE,
    "@id": `${SITE_URL}/#organization`,
    name: site.brand.name,
    url: ORG_URL,
    logo: { "@type": "ImageObject", url: abs("/brand/logo-512.png"), width: 512, height: 512 },
    ...(c.phone.confirmed && c.phone.value ? { telephone: c.phone.value } : {}),
  };
}

/** Bare reference to the organization node, for nodes on a page that already carries organizationLd or orgRef. */
export const orgId = () => ({ "@id": `${SITE_URL}/#organization` });

export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.brand.name,
    url: `${SITE_URL}/${locale}/`,
    inLanguage: LOCALES[locale].htmlLang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.href) })),
  };
}

/** schema.org Offers for one price group: price + UnitPriceSpecification (per lesson of N hours / per person). */
export function priceOffersLd(group: PriceGroup, locale: Locale) {
  const P = { ru: { weekday: "будни", weekend: "выходные", person: "с человека", lesson: "за урок" }, en: { weekday: "weekdays", weekend: "weekends", person: "per person", lesson: "per lesson" } }[locale === "ru" ? "ru" : "en"];
  const url = abs(`/${locale}/prices/`);
  return group.items.map((it) => {
    const name = [t(it.name, locale), it.days !== "any" ? P[it.days] : "", hoursLabel(it.hours, locale)].filter(Boolean).join(", ");
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      name,
      price: it.price,
      priceCurrency: prices.currency,
      url,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: it.price,
        priceCurrency: prices.currency,
        unitText: P[it.unit],
        ...(it.unit === "person" ? { referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: P.person } } : {}),
        validFrom: prices.updated,
      },
      eligibleDuration: { "@type": "QuantitativeValue", value: it.hours, unitCode: "HUR" },
    };
    return offer;
  });
}
