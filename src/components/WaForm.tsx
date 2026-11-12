"use client";
import { useRef, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { track } from "@/lib/track";

type Option = { value: string; label: string };
type Props = { d: Pick<Dict, "form" | "levels">; offers: Option[]; preselect?: string; id?: string; wa: string; phone?: { value: string; display: string } | null; privacyHref?: string };

/**
 * Booking form for hosting without a server: nothing is sent from the site.
 * On submit it opens WhatsApp with a prefilled message; the visitor sends it themselves.
 * Nothing from the fields goes to analytics.
 */
export function WaForm({ d, offers, preselect, id = "booking", wa, phone, privacyHref }: Props) {
  const f = d.form;
  const [bad, setBad] = useState(false);
  const errRef = useRef<HTMLParagraphElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      setBad(true);
      requestAnimationFrame(() => errRef.current?.focus());
      return;
    }
    setBad(false);
    const offer = offers.find((o) => o.value === fd.get("offer"))?.label;
    const level = fd.get("level") as string;
    const lines = [
      f.waHello,
      `${f.name}: ${name}`,
      offer && `${f.offer}: ${offer}`,
      fd.get("date") && `${f.date}: ${fd.get("date")}`,
      `${f.people}: ${fd.get("people") || 1}`,
      level && level !== "unknown" && `${f.level}: ${d.levels[level as "beginner"].name}`,
      String(fd.get("comment") || "").trim() && `${f.comment}: ${String(fd.get("comment")).trim()}`,
    ].filter(Boolean);
    track("whatsapp_click", { item: String(fd.get("offer") || "") || undefined });
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  };

  return (
    <form className="form" id={id} onSubmit={onSubmit} noValidate>
      <p className="form__row form__row--full form__hint">
        {f.waIntro}
        {privacyHref && (
          <>
            {" "}
            <a href={privacyHref}>{f.privacy}</a>
          </>
        )}
      </p>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-name`}>
          {f.name} <span aria-hidden="true">*</span>
        </label>
        <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={80} aria-invalid={bad || undefined} aria-describedby={bad ? `${id}-name-err` : undefined} />
        {bad && (
          <p className="form__err" id={`${id}-name-err`} ref={errRef} tabIndex={-1} role="alert">
            {f.required}
          </p>
        )}
      </div>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-offer`}>{f.offer}</label>
        <select id={`${id}-offer`} name="offer" defaultValue={preselect ?? ""}>
          <option value="">{f.offerUnknown}</option>
          {offers.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        <label htmlFor={`${id}-date`}>{f.date}</label>
        <input id={`${id}-date`} name="date" type="date" />
      </div>
      <div className="form__row">
        <label htmlFor={`${id}-people`}>{f.people}</label>
        <input id={`${id}-people`} name="people" type="number" min={1} max={50} defaultValue={1} inputMode="numeric" />
      </div>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-level`}>{f.level}</label>
        <select id={`${id}-level`} name="level" defaultValue="unknown">
          <option value="unknown">—</option>
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <option key={l} value={l}>
              {d.levels[l].name}
            </option>
          ))}
        </select>
        <ul className="form__hint form__levels">
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <li key={l}>
              <b>{d.levels[l].name}:</b> {d.levels[l].hint.toLowerCase()}
            </li>
          ))}
        </ul>
      </div>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-comment`}>{f.comment}</label>
        <textarea id={`${id}-comment`} name="comment" rows={3} maxLength={1000} aria-describedby={`${id}-comment-hint`} />
        <p className="form__hint" id={`${id}-comment-hint`}>{f.commentHint}</p>
      </div>
      <div className="form__row form__row--full btns">
        <button className="btn btn--accent" type="submit">
          {f.waSubmit}
        </button>
        {phone && (
          <a className="btn btn--ghost" href={`tel:${phone.value}`} data-track="phone_click">
            <span>{f.call}: <span className="nowrap">{phone.display}</span></span>
          </a>
        )}
      </div>
    </form>
  );
}
