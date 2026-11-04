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
        <main id="main" className="nf">
          <div className="wrap nf__inner">
            <p className="kicker">404</p>
            <h1>Страница не найдена</h1>
            <p>Возможно, адрес изменился.</p>
            <p lang="en">Page not found. The address may have changed.</p>
            <div className="btns">
              <Link className="btn btn--accent" href="/ru/">На главную</Link>
              <Link className="btn btn--ghost" href="/en/" lang="en">English home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
