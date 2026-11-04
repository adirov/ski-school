"use client";
import Link from "next/link";
import { BASE_PATH } from "@/lib/env";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Item = { title: string; description: string; href: string; text: string; category: string };

/** Client-side search over a static JSON index. The results page is noindex. */
export function GuideSearch({ locale, labels }: { locale: string; labels: { search: string; placeholder: string; button: string; results: string; noResults: string } }) {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    fetch(`${BASE_PATH}/${locale}/search-index.json`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [locale]);
  useEffect(() => setQ(initial), [initial]);
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    if (!items || !words.length) return [];
    return items
      .map((it) => {
        const hay = `${it.title} ${it.description} ${it.text}`.toLowerCase();
        const score = words.reduce((s, w) => s + (it.title.toLowerCase().includes(w) ? 5 : 0) + (hay.includes(w) ? 1 : 0), 0);
        return { it, score };
      })
      .filter((r) => r.score > 0 && words.every((w) => `${r.it.title} ${r.it.description} ${r.it.text}`.toLowerCase().includes(w)))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.it);
  }, [items, q]);
  return (
    <div className="search">
      <form role="search" action={`/${locale}/search/`} method="get" className="search__form">
        <label htmlFor="q" className="sr-only">
          {labels.search}
        </label>
        <input id="q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.placeholder} />
        <button className="btn btn--dark" type="submit">
          {labels.button}
        </button>
      </form>
      {q.trim().length > 1 && (
        <section aria-live="polite">
          <h2 className="h3">{labels.results}</h2>
          {items && results.length === 0 && <p>{labels.noResults}</p>}
          <ul className="search__list">
            {results.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>{r.title}</Link>
                <p>{r.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
