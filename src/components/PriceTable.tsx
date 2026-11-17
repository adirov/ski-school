import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { fmtPrice, hoursLabel, t, type PriceGroup } from "@/lib/content";

export { hoursLabel };

/** Visually hidden " · " between parts of a row label, so copied or extracted text reads "Half day · weekdays · 3 hours". */
const Sep = () => <span className="sr-only"> · </span>;

/** One price group (private / group) as an accessible table. The same numbers go to JSON-LD (lib/seo.ts priceOffersLd). */
export function PriceTable({ group, locale, headingLevel = 2, title }: { group: PriceGroup; locale: Locale; headingLevel?: 2 | 3; title?: string }) {
  const P = getDict(locale).prices;
  const H = headingLevel === 2 ? "h2" : "h3";
  const id = `price-${group.key}`;
  return (
    <section className="price" aria-labelledby={id}>
      <H id={id} className={headingLevel === 2 ? "h3" : undefined}>
        {title ?? t(group.title, locale)}
      </H>
      {group.note && <p className="price__note">{t(group.note, locale)}</p>}
      <div className="table-wrap">
        <table className="price__table">
          <thead>
            <tr>
              <th scope="col">{P.colFormat}</th>
              <th scope="col" className="price__dur">{P.colDuration}</th>
              <th scope="col">{P.colPrice}</th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((it) => (
              <tr key={it.key}>
                <th scope="row">
                  {t(it.name, locale)}
                  {it.days !== "any" && (
                    <span className="price__days">
                      <Sep />
                      {P.days[it.days]}
                    </span>
                  )}
                  {/* Narrow screens hide the duration column and show it here via CSS (attr), so the text holds it only once. */}
                  <span className="price__dur-m" data-dur={hoursLabel(it.hours, locale)} aria-hidden="true" />
                </th>
                <td className="price__dur">{hoursLabel(it.hours, locale)}</td>
                <td className="price__sum">
                  <b>{fmtPrice(it.price, locale)}</b> <span>{P.unit[it.unit]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
