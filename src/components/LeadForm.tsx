"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { LeadResult } from "@/lib/lead";
import { track } from "@/lib/track";
import { IS_PREVIEW, STATIC_EXPORT } from "@/lib/env";

type Option = { value: string; label: string };
type Props = { locale: Locale; d: Pick<Dict, "form" | "levels">; offers: Option[]; preselect?: string; id?: string };

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ (Math.random() * 16) >> (+c / 4)).toString(16));

export function LeadForm({ locale, d, offers, preselect, id = "lead" }: Props) {
  const f = d.form;
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "error" | "dry">("idle");
  const [code, setCode] = useState<string>("");
  const [bad, setBad] = useState<string[]>([]);
  const token = useRef<string>("");
  const requestId = useRef<string>("");
  const statusRef = useRef<HTMLDivElement>(null);

  const getToken = async () => {
    if (token.current || STATIC_EXPORT) return;
    try {
      const r = await fetch("/api/lead/token/", { cache: "no-store" });
      token.current = (await r.json()).token;
    } catch {}
  };
  useEffect(() => {
    requestId.current = uuid();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return; // no double submit
    const form = e.currentTarget;
    const fd = new FormData(form);
    const missing = ["name", "contact", "people"].filter((k) => !String(fd.get(k) || "").trim());
    if (!fd.get("consent")) missing.push("consent");
    if (missing.length) {
      setBad(missing);
      setCode("validation");
      setState("error");
      statusRef.current?.focus();
      return;
    }
    setBad([]);
    if (STATIC_EXPORT) {
      // Static hosting has no server to receive leads: say so instead of pretending.
      setCode("not_configured");
      setState("error");
      statusRef.current?.focus();
      return;
    }
    setState("sending");
    await getToken();
    const payload = {
      locale,
      name: fd.get("name"),
      contact: fd.get("contact"),
      offer: fd.get("offer") || "",
      date: fd.get("date") || "",
      people: fd.get("people"),
      level: fd.get("level") || "unknown",
      comment: fd.get("comment") || "",
      consent: fd.get("consent") === "on",
      website: fd.get("website") || "",
      token: token.current,
      requestId: requestId.current,
      page: window.location.pathname,
    };
    let res: LeadResult;
    try {
      const r = await fetch("/api/lead/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      res = await r.json();
    } catch {
      setCode("network");
      setState("error");
      statusRef.current?.focus();
      return;
    }
    if (res.ok) {
      track("lead_submit", { item: String(payload.offer || "none") });
      if (res.dryRun) {
        setState("dry");
        requestId.current = uuid();
        statusRef.current?.focus();
        return;
      }
      router.push(`/${locale}/thank-you/`);
      return;
    }
    if (res.code === "too_fast") token.current = "";
    setBad(res.fields ?? []);
    setCode(res.code);
    setState("error");
    statusRef.current?.focus();
  };

  const err = (k: string) => bad.includes(k);
  const desc = (k: string) => (err(k) ? `${id}-${k}-err` : undefined);

  return (
    <form className="form" id={id} onSubmit={onSubmit} onFocus={getToken} noValidate aria-describedby={`${id}-status`}>
      <div className="form__row">
        <label htmlFor={`${id}-name`}>
          {f.name} <span aria-hidden="true">*</span>
        </label>
        <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={80} aria-invalid={err("name") || undefined} aria-describedby={desc("name")} />
        {err("name") && <p className="form__err" id={`${id}-name-err`}>{f.required}</p>}
      </div>
      <div className="form__row">
        <label htmlFor={`${id}-contact`}>
          {f.contact} <span aria-hidden="true">*</span>
        </label>
        <input id={`${id}-contact`} name="contact" autoComplete="tel" required maxLength={120} aria-invalid={err("contact") || undefined} aria-describedby={desc("contact")} />
        {err("contact") && <p className="form__err" id={`${id}-contact-err`}>{f.required}</p>}
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
        <label htmlFor={`${id}-people`}>
          {f.people} <span aria-hidden="true">*</span>
        </label>
        <input id={`${id}-people`} name="people" type="number" min={1} max={50} defaultValue={1} inputMode="numeric" required aria-invalid={err("people") || undefined} />
      </div>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-level`}>{f.level}</label>
        <select id={`${id}-level`} name="level" defaultValue="unknown">
          <option value="unknown">—</option>
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <option key={l} value={l}>
              {d.levels[l].name}: {d.levels[l].hint}
            </option>
          ))}
        </select>
      </div>
      <div className="form__row form__row--full">
        <label htmlFor={`${id}-comment`}>{f.comment}</label>
        <textarea id={`${id}-comment`} name="comment" rows={4} maxLength={1500} aria-describedby={`${id}-comment-hint`} />
        <p className="form__hint" id={`${id}-comment-hint`}>{f.commentHint}</p>
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form__row form__row--full form__check">
        <input id={`${id}-consent`} name="consent" type="checkbox" required aria-invalid={err("consent") || undefined} />
        <label htmlFor={`${id}-consent`}>
          {f.consent} (<Link href={`/${locale}/privacy/`}>{f.privacy}</Link>) <span aria-hidden="true">*</span>
        </label>
      </div>
      <div className="form__row form__row--full">
        <button className="btn btn--accent btn--wide" type="submit" disabled={state === "sending"} aria-busy={state === "sending"}>
          {state === "sending" ? f.sending : f.submit}
        </button>
      </div>
      <div id={`${id}-status`} ref={statusRef} tabIndex={-1} className="form__status" role="status" aria-live="polite">
        {state === "error" && (
          <p className="alert alert--error">
            {f.errors[code] ?? f.errors.server}
            {code === "not_configured" && IS_PREVIEW && <span className="alert__dev"> {STATIC_EXPORT ? f.devStaticExport : f.devNotConfigured}</span>}
          </p>
        )}
        {state === "dry" && <p className="alert alert--info">{f.dryRun}</p>}
      </div>
    </form>
  );
}
