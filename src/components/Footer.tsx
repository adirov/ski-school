import Link from "next/link";
import { IS_PREVIEW } from "@/lib/env";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { site, factVisible, getArticles, t } from "@/lib/content";
import { Todo } from "./Badge";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const phone = site.contacts.phone;
  const draft = !site.legal.approved;
  return (
    <footer className="ftr">
      <div className="stripe" aria-hidden="true" />
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <p className="ftr__name">{site.brand.name}</p>
          <p>{site.brand.shortDescription[locale] ?? site.brand.shortDescription.ru}</p>
        </div>
        <nav aria-label={d.nav.contact}>
          <ul>
            <li><Link href={`/${locale}/tours/`}>{d.nav.tours}</Link></li>
            {getArticles(locale).length > 0 && <li><Link href={`/${locale}/guides/`}>{d.nav.guides}</Link></li>}
            <li><Link href={`/${locale}/about/`}>{d.nav.about}</Link></li>
            <li><Link href={`/${locale}/faq/`}>{d.nav.faq}</Link></li>
            <li><Link href={`/${locale}/contact/`}>{d.nav.contact}</Link></li>
          </ul>
        </nav>
        <div>
          <ul>
            <li><Link href={`/${locale}/booking-terms/`}>{d.footer.terms}</Link>{draft && IS_PREVIEW && <small> ({d.footer.draftLegal})</small>}</li>
            <li><Link href={`/${locale}/privacy/`}>{d.footer.privacy}</Link>{draft && IS_PREVIEW && <small> ({d.footer.draftLegal})</small>}</li>
            {site.partner && (
              <li><a href={t(site.partner.links.transfer, locale)} target="_blank" rel="noopener" data-track="partner_click" data-track-item="footer">{d.partner.footer}</a></li>
            )}
          </ul>
          {factVisible(phone) && (
            <p className="ftr__phone">
              <a href={`tel:${phone.value}`} data-track="phone_click">{phone.display}</a>
              {!phone.confirmed && <Todo>{phone.todo}</Todo>}
            </p>
          )}
        </div>
      </div>
      <p className="wrap ftr__copy">© {new Date().getFullYear()} {d.footer.rights}</p>
    </footer>
  );
}
