import { notFound } from "next/navigation";
import { IS_PREVIEW } from "@/lib/env";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getPage, site } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { abs, buildMetadata, organizationLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "./Breadcrumbs";
import { Prose } from "./Prose";

export const LEGAL_PAGES = ["booking-terms", "privacy"];

export function mdMetadata(name: string, locale: Locale) {
  const p = getPage(name, locale);
  if (!p) return {};
  // Draft legal texts stay out of the index until the owner approves them (site.json -> legal.approved).
  const noindex = LEGAL_PAGES.includes(name) && !site.legal.approved;
  return buildMetadata({ locale, path: `/${name}/`, title: p.title, description: p.description, available: availableLocales(`/${name}/`), noindex });
}

export function MdPage({ name, locale, legal }: { name: string; locale: Locale; legal?: boolean }) {
  const p = getPage(name, locale);
  if (!p) notFound();
  const d = getDict(locale);
  const { html } = renderMarkdown(p.body);
  return (
    <div className="wrap page wrap--narrow">
      {name === "about" && <JsonLd data={[{ "@context": "https://schema.org", "@type": "AboutPage", url: abs(`/${locale}/about/`), name: p.title, about: { "@id": abs("/#organization") } }, organizationLd(locale)]} />}
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: p.title, href: `/${locale}/${name}/` }]} />
      <h1>{p.title}</h1>
      {legal && !site.legal.approved && IS_PREVIEW && <p className="alert alert--warn">{d.legalDraft}</p>}
      <Prose html={html} />
    </div>
  );
}
