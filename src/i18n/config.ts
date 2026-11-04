/**
 * Locales. A locale gets URLs, sitemap entries and hreflang only when `published` is true.
 * Kazakh is wired into the architecture but stays unpublished until real, reviewed translations exist.
 */
export const LOCALES = {
  ru: { label: "RU", name: "Русский", htmlLang: "ru", ogLocale: "ru_RU", published: true },
  en: { label: "EN", name: "English", htmlLang: "en", ogLocale: "en_US", published: true },
  kk: { label: "KK", name: "Қазақша", htmlLang: "kk", ogLocale: "kk_KZ", published: false },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "ru";
/** Language shown to visitors whose language is not covered (hreflang x-default). */
export const X_DEFAULT_LOCALE: Locale = "en";

export const publishedLocales = (Object.keys(LOCALES) as Locale[]).filter((l) => LOCALES[l].published);

export function isLocale(v: string): v is Locale {
  return (publishedLocales as string[]).includes(v);
}
