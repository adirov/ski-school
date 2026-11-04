"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, publishedLocales, type Locale } from "@/i18n/config";

/** Keeps the visitor on the same page when a translation exists, otherwise opens that language's home page. */
export function LangSwitch({ locale, pathsByLocale, label }: { locale: Locale; pathsByLocale: Record<string, string[]>; label: string }) {
  const pathname = usePathname() || `/${locale}/`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const normalized = rest.endsWith("/") ? rest : `${rest}/`;
  return (
    <nav className="lang" aria-label={label}>
      {publishedLocales.map((l) => {
        const exists = pathsByLocale[l]?.includes(normalized);
        const href = `/${l}${exists ? normalized : "/"}`;
        return l === locale ? (
          <span key={l} aria-current="true" lang={LOCALES[l].htmlLang}>
            {LOCALES[l].label}
          </span>
        ) : (
          <Link key={l} href={href} hrefLang={LOCALES[l].htmlLang} lang={LOCALES[l].htmlLang} title={LOCALES[l].name}>
            {LOCALES[l].label}
          </Link>
        );
      })}
    </nav>
  );
}
