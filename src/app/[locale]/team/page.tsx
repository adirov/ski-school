import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { site, t } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type P = { params: Promise<{ locale: string }> };

/** Exists only when content/site.json has real team members. Otherwise a real 404 (and no nav link, no sitemap entry). */
export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  if (!site.team.length) return {};
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/team/", title: d.nav.team, description: d.nav.team, available: availableLocales("/team/") });
}

export default async function TeamPage({ params }: P) {
  const locale = (await params).locale as Locale;
  if (!site.team.length) notFound();
  const d = getDict(locale);
  return (
    <div className="wrap page">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: d.nav.team, href: `/${locale}/team/` }]} />
      <h1>{d.nav.team}</h1>
      <div className="grid grid--3">
        {site.team.map((m, i) => (
          <article key={i} className="person-card">
            <h2 className="h3">{t(m.name, locale)}</h2>
            <p className="kicker">{t(m.role, locale)}</p>
            <p>{t(m.bio, locale)}</p>
            {m.credentials.length > 0 && <ul className="ticks">{m.credentials.map((c) => <li key={c}>{c}</li>)}</ul>}
          </article>
        ))}
      </div>
    </div>
  );
}
