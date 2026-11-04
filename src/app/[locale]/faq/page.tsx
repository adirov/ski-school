import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getFaq, t } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Todo } from "@/components/Badge";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/faq/", title: d.faqPage.h1, description: d.faqPage.lead, available: availableLocales("/faq/") });
}

/** Plain, visible Q&A for visitors. No FAQPage markup: we do not chase FAQ rich results. */
export default async function FaqPage({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const items = getFaq(locale);
  return (
    <div className="wrap page wrap--narrow">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: d.faqPage.h1, href: `/${locale}/faq/` }]} />
      <h1>{d.faqPage.h1}</h1>
      <p className="lead">{d.faqPage.lead}</p>
      <div className="faq faq--open">
        {items.map((f, i) => (
          <section key={i}>
            <h2 className="h3">{t(f.q, locale)}</h2>
            {f.confirmed ? <p>{t(f.a, locale)}</p> : <Todo>{f.todo}</Todo>}
          </section>
        ))}
      </div>
    </div>
  );
}
