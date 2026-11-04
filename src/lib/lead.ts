import { z } from "zod";

/** Shared between the client form and the server route. The server is the source of truth. */
export const LeadSchema = z.object({
  locale: z.enum(["ru", "en", "kk"]),
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(5).max(120),
  offer: z.string().trim().max(120).optional().default(""),
  date: z.string().trim().max(40).optional().default(""),
  people: z.coerce.number().int().min(1).max(50),
  level: z.enum(["beginner", "intermediate", "advanced", "unknown"]),
  comment: z.string().trim().max(1500).optional().default(""),
  consent: z.literal(true),
  // anti-spam
  website: z.string().max(0).optional().default(""), // honeypot, must stay empty
  token: z.string().min(10).max(200),
  requestId: z.string().uuid(),
  page: z.string().max(200).optional().default(""),
});
export type Lead = z.infer<typeof LeadSchema>;

export type LeadResult =
  | { ok: true; dryRun?: boolean }
  | { ok: false; code: "validation" | "not_configured" | "rate_limited" | "too_fast" | "duplicate" | "server"; fields?: string[] };
