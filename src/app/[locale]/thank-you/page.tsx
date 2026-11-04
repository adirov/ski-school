import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { getArticles } from "@/lib/content";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/thank-you/", title: d.thanks.h1, description: d.thanks.lead, available: availableLocales("/thank-you/"), noindex: true });
}

export default async function ThankYou({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return (
    <section className="nf">
      <div className="wrap nf__inner">
        <h1>{d.thanks.h1}</h1>
        <p className="lead">{d.thanks.lead}</p>
        <div className="btns">
          <Link className="btn btn--accent" href={`/${locale}/`}>{d.thanks.back}</Link>
          {getArticles(locale).length > 0 && <Link className="btn btn--ghost" href={`/${locale}/guides/`}>{d.nav.guides}</Link>}
        </div>
      </div>
    </section>
  );
}
