"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  allLabel?: string;
  levels: { key: string; name: string; hint?: string }[];
  emptyText: string;
  children: React.ReactNode;
  /** "chips" for the catalog, "cards" for the larger home picker. */
  variant?: "chips" | "cards";
};

/**
 * Filters server-rendered cards by level without changing the URL,
 * so filters never create duplicate indexable pages. All cards stay in the HTML.
 */
export function LevelFilter({ label, allLabel, levels, emptyText, children, variant = "chips" }: Props) {
  const [level, setLevel] = useState<string>("");
  const [empty, setEmpty] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!box.current) return;
    const cards = [...box.current.querySelectorAll<HTMLElement>("[data-levels]")];
    setEmpty(level !== "" && !cards.some((c) => c.dataset.levels?.split(" ").includes(level)));
  }, [level]);
  const opts = allLabel ? [{ key: "", name: allLabel }, ...levels] : levels;
  return (
    <div className={`lf lf--${variant}`}>
      <div className="lf__opts" role="group" aria-label={label}>
        {opts.map((o) => (
          <button key={o.key || "all"} type="button" aria-pressed={level === o.key} onClick={() => setLevel(level === o.key && !allLabel ? "" : o.key)}>
            <span className="lf__name">{o.name}</span>
            {"hint" in o && o.hint && <span className="lf__hint">{o.hint}</span>}
          </button>
        ))}
      </div>
      <div ref={box} className="lf__items" data-filter={level || undefined}>
        {children}
      </div>
      <p className="lf__empty" role="status" hidden={!empty}>
        {emptyText}
      </p>
    </div>
  );
}
