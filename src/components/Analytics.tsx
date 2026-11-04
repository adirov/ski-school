"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ANALYTICS, ANALYTICS_ENABLED } from "@/lib/env";
import { track, ALLOWED_EVENTS } from "@/lib/track";

const KEY = "as-consent";

/**
 * Loads analytics only when an ID is configured AND the visitor agreed.
 * Click events are collected from elements with data-track="event_name" (no personal data).
 */
export function Analytics({ text, accept, decline }: { text: string; accept: string; decline: string }) {
  const [consent, setConsent] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "yes" || v === "no") setConsent(v);
    } catch {}
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track;
      if (name && (ALLOWED_EVENTS as readonly string[]).includes(name)) track(name as (typeof ALLOWED_EVENTS)[number], { item: el?.dataset.trackItem });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!ANALYTICS_ENABLED) return null;

  const choose = (v: "yes" | "no") => {
    setConsent(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };

  return (
    <>
      {consent === "yes" && ANALYTICS.ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ANALYTICS.ga4}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {consent === "yes" && ANALYTICS.yandex && (
        <Script id="ym" strategy="afterInteractive">{`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(ANALYTICS.yandex)},"init",{clickmap:false,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}</Script>
      )}
      {consent === null && (
        <div className="consent" role="region" aria-label="Cookies">
          <p>{text}</p>
          <div className="consent__actions">
            <button type="button" className="btn btn--dark" onClick={() => choose("yes")}>{accept}</button>
            <button type="button" className="btn btn--ghost" onClick={() => choose("no")}>{decline}</button>
          </div>
        </div>
      )}
    </>
  );
}
