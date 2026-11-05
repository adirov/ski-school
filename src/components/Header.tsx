import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getArticles, site } from "@/lib/content";
import { LangSwitch } from "./LangSwitch";
import { MobileNav } from "./MobileNav";

export function Header({ locale, pathsByLocale }: { locale: Locale; pathsByLocale: Record<string, string[]> }) {
  const d = getDict(locale);
  const links = [
    { href: `/${locale}/tours/`, label: d.nav.tours },
    ...(getArticles(locale).length ? [{ href: `/${locale}/guides/`, label: d.nav.guides }] : []),
    { href: `/${locale}/about/`, label: d.nav.about },
    ...(site.team.length ? [{ href: `/${locale}/team/`, label: d.nav.team }] : []),
    { href: `/${locale}/faq/`, label: d.nav.faq },
    { href: `/${locale}/contact/`, label: d.nav.contact },
  ];
  return (
    <header className="hdr">
      <div className="wrap hdr__row">
        <Link href={`/${locale}/`} className="logo">
          <svg viewBox="0 0 54 32" aria-hidden="true" width="54" height="32">
            <path fill="currentColor" d="M1 31 17 9l3.2 4.6L26 2l7.6 13.2 3.4-4.4L53 31H45L37 20.5 34.2 24 26 10.5 21.6 19.5 17 14 7.5 31z" />
            <path fill="#0b0b0c" d="m26 2 2.6 9.2-2.6-2-2.3 3.4zM37 10.8l1.4 5.4-1.4-1-1.2 1.8z" />
          </svg>
          <span>
            <b>ALMATY</b>
            <small>
              SNOWBOARD SCHOOL<i>.</i>
            </small>
          </span>
        </Link>
        <nav className="nav" aria-label={d.menu}>
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <LangSwitch locale={locale} pathsByLocale={pathsByLocale} label={d.langSwitch} />
        <Link href={`/${locale}/contact/`} className="btn btn--accent hdr__cta">
          {d.cta.request}
        </Link>
        <MobileNav links={links} labels={{ menu: d.menu, close: d.close }} cta={{ href: `/${locale}/contact/`, label: d.cta.request }} />
      </div>
    </header>
  );
}
