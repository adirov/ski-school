import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { categories, type Article } from "@/lib/content";
import { Pic } from "./Pic";
import { Badge } from "./Badge";

export function PostList({ locale, articles }: { locale: Locale; articles: Article[] }) {
  const d = getDict(locale);
  return (
    <div className="grid grid--3">
      {articles.map((a) => (
        <article key={a.slug} className="post">
          <Link href={`/${locale}/guides/${a.slug}/`} className="post__media" tabIndex={-1} aria-hidden="true">
            <Pic id={a.cover} locale={locale} sizes="(max-width: 640px) 100vw, 400px" decorative />
          </Link>
          <p className="kicker">
            {categories[a.category]?.[locale]?.name} {a.status === "draft" && <Badge kind="draft">{d.badge.draft}</Badge>}
          </p>
          <h2 className="h3">
            <Link href={`/${locale}/guides/${a.slug}/`}>{a.title}</Link>
          </h2>
          <p>{a.description}</p>
          <p className="small">
            {d.guides.updated}: <time dateTime={a.updated}>{a.updated}</time>
          </p>
        </article>
      ))}
    </div>
  );
}
