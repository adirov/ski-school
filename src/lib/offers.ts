import type { Locale } from "@/i18n/config";
import { getServices, getTours, t } from "./content";

/** Options for the "interested in" select: visible services and tours. Value = readable title for the manager. */
export function offerOptions(locale: Locale) {
  return [
    ...getServices(locale).map((s) => ({ value: t(s.title, locale)!, label: t(s.shortTitle, locale) ?? t(s.title, locale)! })),
    ...getTours(locale).map((x) => ({ value: t(x.title, locale)!, label: t(x.title, locale)! })),
  ];
}
