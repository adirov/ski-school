import { NextResponse, type NextRequest } from "next/server";
import { LeadSchema, type LeadResult } from "@/lib/lead";
import { checkToken, deliver, deliveryConfigured, forgetRequest, isDryRun, isDuplicate, rateLimited } from "@/lib/lead-server";

export const dynamic = "force-dynamic";

const reply = (body: LeadResult, status: number) => NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(ip)) return reply({ ok: false, code: "rate_limited" }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return reply({ ok: false, code: "validation" }, 400);
  }
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    // Honeypot filled: pretend nothing special happened, but deliver nothing.
    if (fields.includes("website")) return reply({ ok: false, code: "validation" }, 400);
    return reply({ ok: false, code: "validation", fields }, 400);
  }
  const lead = parsed.data;

  const tok = checkToken(lead.token);
  if (tok === "too_fast") return reply({ ok: false, code: "too_fast" }, 400);
  if (tok !== "ok") return reply({ ok: false, code: "validation", fields: ["token"] }, 400);

  if (isDuplicate(lead.requestId)) return reply({ ok: false, code: "duplicate" }, 409);

  if (isDryRun()) {
    console.info("[lead:dry-run]", { requestId: lead.requestId, locale: lead.locale, offer: lead.offer });
    return reply({ ok: true, dryRun: true }, 200);
  }
  if (!deliveryConfigured()) {
    forgetRequest(lead.requestId);
    return reply({ ok: false, code: "not_configured" }, 503);
  }
  try {
    await deliver(lead);
    return reply({ ok: true }, 200);
  } catch (e) {
    forgetRequest(lead.requestId);
    console.error("[lead] delivery failed", (e as Error).message);
    return reply({ ok: false, code: "server" }, 502);
  }
}
