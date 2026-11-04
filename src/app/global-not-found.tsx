import "@fontsource-variable/montserrat/wght.css";
import "@fontsource/golos-text/400.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404 · Almaty Snowboard", robots: { index: false } };

/** Real 404 for any unmatched URL (HTTP status 404). Bilingual because the locale is unknown here. */
export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <body>
        <header className="hdr">
          <div className="wrap hdr__row">
            <Link href="/ru/" className="logo">
              <svg viewBox="0 0 54 32" aria-hidden="true" width="54" height="32">
                <path fill="currentColor" d="M1 31 17 9l3.2 4.6L26 2l7.6 13.2 3.4-4.4L53 31H45L37 20.5 34.2 24 26 10.5 21.6 19.5 17 14 7.5 31z" />
              </svg>
              <span>
                <b>ALMATY</b>
                <small>SNOWBOARD SCHOOL<i>.</i></small>
              </span>
            </Link>
          </div>
        </header>
        <main id="main" className="nf">
          <div className="wrap nf__inner">
            <p className="kicker">404</p>
            <h1>Страница не найдена</h1>
            <p>Возможно, адрес изменился.</p>
            <p lang="en">Page not found. The address may have changed.</p>
            <div className="btns">
              <Link className="btn btn--accent" href="/ru/">На главную</Link>
              <Link className="btn btn--ghost" href="/ru/tours/">Туры и занятия</Link>
              <Link className="btn btn--ghost" href="/en/" lang="en">English home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
