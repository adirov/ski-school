import Link from "next/link";
import { Pic } from "./Pic";
import { Badge } from "./Badge";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  href: string;
  title: string;
  summary: string;
  image: string;
  levels: string[];
  status: "demo" | "confirmed" | "hidden" | "trash";
  kicker?: string;
  priority?: boolean;
};

export function OfferCard({ locale, href, title, summary, image, levels, status, kicker, priority }: Props) {
  const d = getDict(locale);
  return (
    <article className="card" data-levels={levels.join(" ")}>
      <div className="card__media">
        <Pic id={image} locale={locale} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px" decorative priority={priority} />
        {status === "demo" && <Badge kind="demo">{d.badge.demo}</Badge>}
      </div>
      <div className="card__body">
        {kicker && <p className="kicker">{kicker}</p>}
        <h3>
          <Link href={href} className="card__link">
            {title}
          </Link>
        </h3>
        <p>{summary}</p>
        <ul className="chips" aria-label={d.tour.level}>
          {levels.map((l) => (
            <li key={l} className={`chip chip--${l}`}>
              {d.levels[l]?.name ?? l}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
