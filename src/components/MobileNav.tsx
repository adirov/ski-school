"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type L = { href: string; label: string };

export function MobileNav({ links, labels, cta }: { links: L[]; labels: { menu: string; close: string }; cta: L }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="mnav">
      <button ref={btn} type="button" className="mnav__btn" aria-expanded={open} aria-controls="mnav-panel" onClick={() => setOpen((o) => !o)}>
        <span className="mnav__icon" aria-hidden="true" />
        <span className="sr-only">{open ? labels.close : labels.menu}</span>
      </button>
      <div id="mnav-panel" className="mnav__panel" hidden={!open}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <Link className="btn btn--accent" href={cta.href}>
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
