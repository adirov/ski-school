import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { factVisible, site } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { availableLocales } from "@/lib/routes";
import { offerOptions } from "@/lib/offers";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { Todo } from "@/components/Badge";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  return buildMetadata({ locale, path: "/contact/", title: d.contact.h1, description: d.contact.lead, available: availableLocales("/contact/") });
}

export default async function ContactPage({ params }: P) {
  const locale = (await params).locale as Locale;
  const d = getDict(locale);
  const c = site.contacts;
  const wa = c.whatsapp;
  const area = factVisible(site.serviceArea) ? (site.serviceArea.value[locale] as string[]) : null;
  const anyDirect = [c.phone, c.whatsapp, c.email].some(factVisible);
  return (
    <div className="wrap page">
      <Breadcrumbs label="Breadcrumbs" items={[{ name: d.breadcrumbs.home, href: `/${locale}/` }, { name: d.contact.h1, href: `/${locale}/contact/` }]} />
      <header className="page__head">
        <h1>{d.contact.h1}</h1>
        <p className="lead">{d.contact.lead}</p>
      </header>
      <div className="form-wrap">
        <div className="contact-info">
          <h2 className="h3">{d.contact.direct}</h2>
          {anyDirect ? (
            <ul className="contact-list">
              {factVisible(c.person) && (
                <li>
                  {c.person.value[locale] ?? c.person.value.ru}
                  {!c.person.confirmed && <Todo>{c.person.todo}</Todo>}
                </li>
              )}
              {factVisible(c.phone) && (
                <li>
                  <a href={`tel:${c.phone.value}`} data-track="phone_click">{c.phone.display}</a>
                  {!c.phone.confirmed && <Todo>{c.phone.todo}</Todo>}
                </li>
              )}
              {factVisible(wa) && (
                <li>
                  <a href={`https://wa.me/${String(wa.value).replace(/\D/g, "")}`} target="_blank" rel="noopener" data-track="whatsapp_click">WhatsApp</a>
                  {!wa.confirmed && <Todo>{wa.todo}</Todo>}
                </li>
              )}
              {factVisible(c.email) && (
                <li>
                  <a href={`mailto:${c.email.value}`}>{c.email.value}</a>
                </li>
              )}
            </ul>
          ) : (
            <p>{d.contact.noDirect}</p>
          )}
          {!factVisible(wa) && <Todo>{wa.todo}</Todo>}
          {area && (
            <>
              <h2 className="h3">{d.contact.serviceArea}</h2>
              <p>
                {area.join(", ")}
                {!site.serviceArea.confirmed && <Todo>{site.serviceArea.todo}</Todo>}
              </p>
            </>
          )}
        </div>
        <LeadForm locale={locale} d={{ form: d.form, levels: d.levels }} offers={offerOptions(locale)} />
      </div>
    </div>
  );
}
