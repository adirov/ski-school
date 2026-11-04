import "@fontsource-variable/montserrat/wght.css";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, publishedLocales, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { IS_PREVIEW, SITE_URL } from "@/lib/env";
import { routesFor } from "@/lib/routes";
import { site } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedLocales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.brand.name, template: `%s | ${site.brand.name}` },
  applicationName: site.brand.name,
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#0b0b0c", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const d = getDict(locale);
  const pathsByLocale = Object.fromEntries(publishedLocales.map((x) => [x, routesFor(x).map((r) => r.path)]));
  return (
    <html lang={LOCALES[locale].htmlLang}>
      <body>
        <a className="skip" href="#main">
          {d.skip}
        </a>
        {IS_PREVIEW && <div className="previewbar">{d.previewBar}</div>}
        <Header locale={locale} pathsByLocale={pathsByLocale} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer locale={locale} />
        <Analytics text={d.consent.text} accept={d.consent.accept} decline={d.consent.decline} />
      </body>
    </html>
  );
}
