import type { Locale } from "@/i18n/config";
import { places, site, t } from "@/lib/content";

/** Resorts where lessons take place, as a text list (service and contact pages). Hidden until site.placesConfirmed. */
export function PlaceList({ locale, title, lead, as: H = "h2" }: { locale: Locale; title: string; lead?: string; as?: "h2" | "h3" }) {
  if (!site.placesConfirmed || !places.length) return null;
  return (
    <section className="place-list" aria-label={title}>
      <H className={H === "h2" ? undefined : "h3"}>{title}</H>
      {lead && <p>{lead}</p>}
      <ul>
        {places.map((pl) => (
          <li key={pl.name.ru}>
            <b>{t(pl.name, locale)}</b>
            {t(pl.text, locale) && <> — {t(pl.text, locale)}</>}
          </li>
        ))}
      </ul>
    </section>
  );
}
