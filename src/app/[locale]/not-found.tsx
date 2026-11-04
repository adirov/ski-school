import Link from "next/link";

/** Shown when a page inside a locale calls notFound() (e.g. an unknown tour slug). Status 404. */
export default function NotFound() {
  return (
    <section className="nf">
      <div className="wrap nf__inner">
        <p className="kicker">404</p>
        <h1>Страница не найдена · Page not found</h1>
        <p>Возможно, адрес изменился. The address may have changed.</p>
        <div className="btns">
          <Link className="btn btn--accent" href="/ru/">На главную</Link>
          <Link className="btn btn--ghost" href="/en/" lang="en">English home</Link>
        </div>
      </div>
    </section>
  );
}
