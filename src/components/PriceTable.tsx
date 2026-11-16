import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { fmtPrice, t, type PriceGroup } from "@/lib/content";

export const hoursLabel = (h: number, locale: Locale) => {
  if (locale !== "ru") return `${h} ${h === 1 ? "hour" : "hours"}`;
  const n = h % 100;
  const w = n % 10 === 1 && n !== 11 ? "час" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "часа" : "часов";
  return `${h} ${w}`;
};

/** One price group (private / group) as an accessible table. The same numbers go to JSON-LD (lib/seo.ts priceOffersLd). */
export function PriceTable({ group, locale, headingLevel = 2 }: { group: PriceGroup; locale: Locale; headingLevel?: 2 | 3 }) {
  const P = getDict(locale).prices;
  const H = headingLevel === 2 ? "h2" : "h3";
  const id = `price-${group.key}`;
  return (
    <section className="price" aria-labelledby={id}>
      <H id={id} className={headingLevel === 2 ? "h3" : undefined}>
        {t(group.title, locale)}
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
                  {it.days !== "any" && <span className="price__days">{P.days[it.days]}</span>}
                  <span className="price__dur-m">{hoursLabel(it.hours, locale)}</span>
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
