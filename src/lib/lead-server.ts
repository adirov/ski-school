import crypto from "node:crypto";
import type { Lead } from "./lead";

const SECRET = process.env.LEAD_FORM_SECRET || "dev-secret-change-me";
const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function issueToken(now = Date.now()) {
  const ts = String(now);
  const sig = crypto.createHmac("sha256", SECRET).update(ts).digest("base64url");
  return `${ts}.${sig}`;
}

export function checkToken(token: string, now = Date.now()): "ok" | "too_fast" | "invalid" {
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return "invalid";
  const expected = crypto.createHmac("sha256", SECRET).update(ts).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "invalid";
  const age = now - Number(ts);
  if (!(age >= 0) || age > MAX_AGE_MS) return "invalid";
  if (age < MIN_FILL_MS) return "too_fast";
  return "ok";
}

/* In-memory guards. On serverless or several instances they are per instance; use Redis/KV for stricter limits. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > limit;
}
const seen = new Map<string, number>();
export function isDuplicate(id: string) {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 30 * 60 * 1000) seen.delete(k);
  if (seen.has(id)) return true;
  seen.set(id, now);
  return false;
}
export function forgetRequest(id: string) {
  seen.delete(id);
}

export function deliveryConfigured() {
  return Boolean((process.env.LEAD_TELEGRAM_BOT_TOKEN && process.env.LEAD_TELEGRAM_CHAT_ID) || process.env.LEAD_WEBHOOK_URL);
}
export const isDryRun = () => process.env.LEAD_DRY_RUN === "1";

const LEVEL = { beginner: "новичок", intermediate: "продолжающий", advanced: "опытный", unknown: "не указан" } as const;

function format(l: Lead) {
  return [
    "Новая заявка с сайта Almaty Snowboard School",
    `Имя: ${l.name}`,
    `Контакт: ${l.contact}`,
    `Интерес: ${l.offer || "не выбрано"}`,
    `Дата: ${l.date || "—"}`,
    `Участников: ${l.people}`,
    `Уровень: ${LEVEL[l.level]}`,
    `Комментарий: ${l.comment || "—"}`,
    `Язык сайта: ${l.locale}; страница: ${l.page || "—"}`,
    `ID: ${l.requestId}`,
  ].join("\n");
}

/** Sends the lead to every configured channel. Throws if none succeeds. */
export async function deliver(l: Lead) {
  const jobs: Promise<Response>[] = [];
  const { LEAD_TELEGRAM_BOT_TOKEN: tg, LEAD_TELEGRAM_CHAT_ID: chat, LEAD_WEBHOOK_URL: hook } = process.env;
  if (tg && chat) {
    jobs.push(fetch(`https://api.telegram.org/bot${tg}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: chat, text: format(l) }) }));
  }
  if (hook) {
    const { token: _t, website: _w, ...data } = l;
    jobs.push(fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source: "almaty-snowboard-site", receivedAt: new Date().toISOString(), lead: data }) }));
  }
  const results = await Promise.allSettled(jobs.map((j) => j.then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; })));
  if (!results.some((r) => r.status === "fulfilled")) throw new Error("All delivery channels failed");
}
