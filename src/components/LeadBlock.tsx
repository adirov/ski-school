import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { factVisible, site } from "@/lib/content";
import { STATIC_EXPORT } from "@/lib/env";
import { deliveryConfigured, isDryRun } from "@/lib/lead-server";
import { offerOptions } from "@/lib/offers";
import { LeadForm } from "./LeadForm";

/**
 * The request form is rendered only when the server can actually deliver requests
 * (LEAD_TELEGRAM_* or LEAD_WEBHOOK_URL at build time, or LEAD_DRY_RUN for local testing).
 * Otherwise visitors get the direct phone contact instead of a form that cannot send anything.
 */
export const LEAD_FORM_ENABLED = !STATIC_EXPORT && (deliveryConfigured() || isDryRun());

export function LeadBlock({ locale, preselect, id }: { locale: Locale; preselect?: string; id?: string }) {
  const d = getDict(locale);
  if (LEAD_FORM_ENABLED) return <LeadForm locale={locale} d={{ form: d.form, levels: d.levels }} offers={offerOptions(locale)} preselect={preselect} id={id} />;
  const phone = site.contacts.phone;
  const person = site.contacts.person;
  const wa = site.contacts.whatsapp;
  const name = factVisible(person) ? (person.value as Record<string, string>)[locale] ?? (person.value as Record<string, string>).ru : null;
  return (
    <div className="offline" id={id}>
      <h3>{d.form.offlineTitle}</h3>
      <p>{d.form.offlineText}</p>
      {factVisible(phone) && (
        <div className="btns">
          <a className="btn btn--accent" href={`tel:${phone.value}`} data-track="phone_click">
            {d.form.call}: {phone.display}
          </a>
          {factVisible(wa) && (
            <a className="btn btn--ghost" href={`https://wa.me/${String(wa.value).replace(/\D/g, "")}`} target="_blank" rel="noopener" data-track="whatsapp_click">
              WhatsApp
            </a>
          )}
        </div>
      )}
      {name && <p className="small">{name}</p>}
    </div>
  );
}
