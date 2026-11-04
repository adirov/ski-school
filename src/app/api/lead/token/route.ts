import { NextResponse } from "next/server";
import { issueToken } from "@/lib/lead-server";

export const dynamic = "force-dynamic";

/** Issues a short-lived signed timestamp; the form must wait a few seconds before using it. */
export function GET() {
  return NextResponse.json({ token: issueToken() }, { headers: { "cache-control": "no-store" } });
}
