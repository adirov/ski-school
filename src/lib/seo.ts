import type { Metadata } from "next";
import { LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { IS_PREVIEW, SITE_URL } from "./env";
import { site, img } from "./content";

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
  const noindex = IS_PREVIEW || m.noindex;
  return {
    title: m.title,
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

export function organizationLd(locale: Locale) {
  const c = site.contacts;
  const sameAs = [c.instagram, c.telegram].filter((f) => f.confirmed && f.value).map((f) => f.value as string);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.brand.name,
    url: `${SITE_URL}/${locale}/`,
    logo: abs(site.brand.logo),
    description: site.brand.shortDescription[locale] ?? site.brand.shortDescription.ru,
  };
  if (sameAs.length) ld.sameAs = sameAs;
  if (c.phone.confirmed && c.phone.value) ld.contactPoint = { "@type": "ContactPoint", telephone: c.phone.value, contactType: "customer service" };
  if (c.email.confirmed && c.email.value) ld.email = c.email.value;
  if (site.serviceArea.confirmed && site.serviceArea.value) ld.areaServed = (site.serviceArea.value[locale] ?? []).map((n: string) => ({ "@type": "Place", name: n }));
  return ld;
}

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
