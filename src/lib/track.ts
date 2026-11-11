import { ANALYTICS } from "./env";

/** The only events we send. Parameters never include names, phones, emails or free text. */
export const ALLOWED_EVENTS = ["lead_submit", "whatsapp_click", "phone_click", "booking_click", "gyg_click", "partner_click"] as const;
export type EventName = (typeof ALLOWED_EVENTS)[number];

type W = Window & { gtag?: (...a: unknown[]) => void; ym?: (...a: unknown[]) => void };

export function track(name: EventName, params: { item?: string } = {}) {
  if (typeof window === "undefined") return;
  const safe = params.item ? { item: String(params.item).slice(0, 80) } : {};
  const w = window as W;
  w.gtag?.("event", name, safe);
  if (ANALYTICS.yandex) w.ym?.(Number(ANALYTICS.yandex), "reachGoal", name, safe);
}
