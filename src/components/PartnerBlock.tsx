import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { site, t } from "@/lib/content";

/** Cross-link to the owner's travel agency (almaty-travel.kz): airport transfer and excursions for visiting riders. */
export function PartnerBlock({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const p = site.partner;
  if (!p) return null;
  const d = getDict(locale).partner;
  const transfer = t(p.links.transfer, locale);
  const tours = t(p.links.tours, locale);
  return (
    <aside className={`partner${compact ? " partner--compact" : ""}`} aria-labelledby={`partner-h-${compact ? "c" : "f"}`}>
      <div className={compact ? "partner__in" : "wrap partner__in"}>
        <div className="partner__txt">
          <p className="label">{d.label}</p>
          <h2 className={compact ? "h3" : undefined} id={`partner-h-${compact ? "c" : "f"}`}>{d.title}</h2>
          <p>{d.text}</p>
        </div>
        <div className="btns partner__btns">
          {transfer && (
            <a className="btn btn--accent" href={transfer} target="_blank" rel="noopener" data-track="partner_click" data-track-item="transfer">
              {d.transfer}
            </a>
          )}
          {tours && (
            <a className="btn btn--ghost" href={tours} target="_blank" rel="noopener" data-track="partner_click" data-track-item="tours">
              {d.tours}
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
