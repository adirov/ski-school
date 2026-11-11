import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { IS_PREVIEW } from "./env";

const ROOT = path.join(process.cwd(), "content");
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

/**
 * The admin panel (/admin, Sveltia CMS) saves cleared inputs as "", [] or {}. Drop them, so an empty field reads
 * as "not set" (shown as "on request" with a TODO in preview) instead of an empty value on the page.
 */
export function clean(v: unknown): unknown {
  if (v === "" || v === null) return v === "" ? undefined : null;
  if (Array.isArray(v)) {
    const a = v.map(clean).filter((x) => x !== undefined);
    return a.length ? a : undefined;
  }
  // Plain objects only: YAML dates arrive as Date and must pass through untouched.
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) {
      const c = clean(x);
      if (c !== undefined) o[k] = c;
    }
    return Object.keys(o).length ? o : undefined;
  }
  return v;
}

/* ---------- shared ---------- */
const LText = z.object({ ru: z.string(), en: z.string().optional(), kk: z.string().optional() });
const LList = z.object({ ru: z.array(z.string()), en: z.array(z.string()).optional(), kk: z.array(z.string()).optional() });
export type LText = z.infer<typeof LText>;

/** Field that may be unknown yet. `value` null means "not confirmed"; `todo` says what to ask the owner. */
const Pending = <T extends z.ZodTypeAny>(t: T) =>
  z.preprocess((v) => v ?? {}, z.object({ value: t.nullable().default(null), todo: z.string().nullable().optional() }));
const Level = z.enum(["beginner", "intermediate", "advanced"]);
export type Level = z.infer<typeof Level>;
/** demo: preview only · confirmed: published · hidden: taken off the site · trash: "deleted" in the admin panel, restorable. */
const Status = z.enum(["demo", "confirmed", "hidden", "trash"]);
/** Optional per-locale SEO overrides set in the admin panel. Empty means "use the title / summary". */
const Seo = z.object({ title: z.object({ ru: z.string().optional(), en: z.string().optional() }).optional(), description: z.object({ ru: z.string().optional(), en: z.string().optional() }).optional() }).optional();
export type Seo = z.infer<typeof Seo>;

export function t<T>(v: { ru?: T; en?: T; kk?: T } | null | undefined, locale: Locale): T | undefined {
  if (!v) return undefined;
  return (v as Record<string, T | undefined>)[locale];
}

/* ---------- media ---------- */
const Media = z.record(z.string(), z.any());
export type Img = { src: string; width: number; height: number; alt: Partial<Record<Locale, string>> };
const media = Media.parse(readJson("media.json")) as Record<string, Img>;
const bySrc = new Map(Object.values(media).filter((m) => m && typeof m === "object" && "src" in m).map((m) => [m.src, m]));
const PUBLIC = path.join(process.cwd(), "public");
/**
 * Image by id from content/media.json ("snowboarder-powder-spray") or by path under public/ ("/images/x.jpg").
 * Paths come from the admin panel uploads; their size is read from the file and alt falls back to the page text.
 */
export function img(ref: string): Img {
  if (ref.startsWith("/")) {
    const known = bySrc.get(ref);
    if (known) return known;
    const file = path.join(PUBLIC, ref);
    if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file)) throw new Error(`Image file not found: public${ref}`);
    const { width, height } = imageSize(fs.readFileSync(file));
    if (!width || !height) throw new Error(`Cannot read image size: public${ref}`);
    return { src: ref, width, height, alt: {} };
  }
  const m = media[ref];
  if (!m || typeof m !== "object" || !("src" in m)) throw new Error(`Unknown image id "${ref}" (content/media.json)`);
  return m;
}

/* ---------- site facts ---------- */
const Fact = z.object({ value: z.any(), confirmed: z.boolean(), todo: z.string().optional(), display: z.string().optional() });
const SiteSchema = z.object({
  brand: z.object({
    name: z.string(),
    legalName: Fact,
    shortDescription: LText,
    logo: z.string(),
    foundedNote: Fact,
    credentialsNote: Fact,
  }),
  contacts: z.object({ person: Fact, phone: Fact, whatsapp: Fact, email: Fact, instagram: Fact, telegram: Fact }),
  address: Fact,
  serviceArea: Fact,
  placesConfirmed: z.boolean().default(false),
  languages: Fact,
  team: z.array(z.object({ name: LText, role: LText, bio: LText, photo: z.string().optional(), credentials: z.array(z.string()).default([]) })),
  teamTodo: z.string().optional(),
  legal: z.object({ approved: z.boolean(), todo: z.string().optional() }),
  seasonNote: Fact,
  /** Owner's travel agency: cross-links for transfers and excursions. Remove the block to hide them. */
  partner: z
    .object({
      name: z.string(),
      links: z.object({ transfer: LText, tours: LText }),
    })
    .optional(),
});
export type Fact = z.infer<typeof Fact>;
export const site = SiteSchema.parse(readJson("site.json"));

/** A fact is shown in production only when confirmed; in preview it is shown with a TODO badge. */
export function factVisible(f: Fact) {
  return f.value != null && (f.confirmed || IS_PREVIEW);
}

/* ---------- services ---------- */
const ServiceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: Status,
  order: z.number().default(100),
  source: z.string().optional(),
  title: LText,
  /** Short label for narrow places such as the booking form select (iPhone cuts long option text). */
  shortTitle: LText.optional(),
  summary: LText,
  body: LList,
  levels: z.array(Level),
  format: z.enum(["private", "group", "both"]),
  /** Typical duration / age shown on the site. Set by Emil 04.11.2026 as defaults until the owner gives exact values. */
  duration: LText.optional(),
  age: LText.optional(),
  image: z.string(),
  todo: z.array(z.string()).default([]),
  seo: Seo,
});
export type Service = z.infer<typeof ServiceSchema>;

/* ---------- tours ---------- */
const TourSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: Status,
  order: z.number().default(100),
  title: LText,
  summary: LText,
  description: LList,
  images: z.array(z.string()).min(1),
  location: LText,
  route: Pending(LText),
  duration: Pending(LText),
  levels: z.array(Level),
  languages: Pending(z.array(z.string())),
  format: z.enum(["private", "group", "both"]),
  groupSize: z.preprocess((v) => v ?? {}, z.object({ min: z.number().nullable().default(null), max: z.number().nullable().default(null), todo: z.string().optional() })),
  season: Pending(LText),
  /** "request": no live calendar, visitors request availability. Only set "live" with a connected booking system. */
  availability: z.enum(["request", "live"]).default("request"),
  price: z.preprocess((v) => v ?? {}, z.object({ amount: z.number().nullable().default(null), currency: z.string().default("KZT"), unit: z.enum(["person", "group"]).nullable().default(null), todo: z.string().optional() })),
  included: Pending(LList),
  notIncluded: Pending(LList),
  meetingPoint: Pending(LText),
  equipment: Pending(LList),
  restrictions: Pending(LList),
  weatherPolicy: Pending(LText),
  bookingTerms: Pending(LText),
  faq: z.array(z.object({ q: LText, a: LText })).default([]),
  relatedArticles: z.array(z.string()).default([]),
  relatedServices: z.array(z.string()).default([]),
  getYourGuideUrl: z.string().url().nullable().default(null),
  seo: Seo,
});
export type Tour = z.infer<typeof TourSchema>;

function loadDir<S extends z.ZodTypeAny>(dir: string, schema: S): z.infer<S>[] {
  const full = path.join(ROOT, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const parsed = schema.safeParse(clean(JSON.parse(fs.readFileSync(path.join(full, f), "utf8"))));
      if (!parsed.success) throw new Error(`content/${dir}/${f}: ${parsed.error.message}`);
      return parsed.data as z.infer<S>;
    });
}

/** Demo items exist only in preview mode. Hidden and trashed items never render. */
const visible = (s: z.infer<typeof Status>) => s === "confirmed" || (s === "demo" && IS_PREVIEW);
const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

const allServices = loadDir("services", ServiceSchema).sort(byOrder);
const allTours = loadDir("tours", TourSchema).sort(byOrder);

export const getServices = (locale: Locale) => allServices.filter((s) => visible(s.status) && t(s.title, locale));
export const getService = (slug: string, locale: Locale) => getServices(locale).find((s) => s.slug === slug);
export const getTours = (locale: Locale) => allTours.filter((x) => visible(x.status) && t(x.title, locale));
export const getTour = (slug: string, locale: Locale) => getTours(locale).find((x) => x.slug === slug);

/* ---------- FAQ ---------- */
const FaqSchema = z.array(z.object({ q: LText, a: LText, confirmed: z.boolean(), todo: z.string().optional() }));
const faq = FaqSchema.parse(clean(readJson("faq.json")) ?? []);
/** Unconfirmed answers are never shown publicly; in preview they appear as TODO items. */
export const getFaq = (locale: Locale) => faq.filter((f) => (f.confirmed || IS_PREVIEW) && t(f.q, locale));

/* ---------- articles ---------- */
const Source = z.object({ title: z.string(), url: z.string().url().nullable().default(null), checked: z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string().nullable().default(null)) });
/** YAML turns an unquoted 2026-11-04 into a Date; keep dates as "YYYY-MM-DD" strings either way. */
const IsoDate = z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string().regex(/^\d{4}-\d{2}-\d{2}/));
const ArticleMeta = z.object({
  title: z.string(),
  description: z.string(),
  translationKey: z.string(),
  category: z.string(),
  /** draft: preview only · published · trash: "deleted" in the admin panel, never rendered, restorable. */
  status: z.enum(["draft", "published", "trash"]),
  /** Optional <title> override; the page heading stays `title`. */
  seoTitle: z.string().optional(),
  author: z.string().nullable().default(null),
  reviewer: z.string().nullable().default(null),
  published: IsoDate,
  updated: IsoDate,
  cover: z.string(),
  answer: z.string(),
  relatedServices: z.array(z.string()).default([]),
  relatedTours: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
  sources: z.array(Source).default([]),
  todo: z.array(z.string()).default([]),
});
export type Article = z.infer<typeof ArticleMeta> & { slug: string; locale: Locale; body: string };

function loadArticles(locale: Locale): Article[] {
  const dir = path.join(ROOT, "articles", locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const parsed = ArticleMeta.safeParse(clean(data) ?? {});
      if (!parsed.success) throw new Error(`content/articles/${locale}/${f}: ${parsed.error.message}`);
      return { ...parsed.data, slug: f.replace(/\.md$/, ""), locale, body: content };
    });
}

export function getArticles(locale: Locale): Article[] {
  return loadArticles(locale)
    .filter((a) => a.status === "published" || (a.status === "draft" && IS_PREVIEW))
    .sort((a, b) => b.published.localeCompare(a.published));
}
export const getArticle = (slug: string, locale: Locale) => getArticles(locale).find((a) => a.slug === slug);

const CategoriesSchema = z.record(z.string(), z.record(z.string(), z.object({ name: z.string(), description: z.string() })));
export const categories = CategoriesSchema.parse(readJson("categories.json"));
export const getCategories = (locale: Locale) =>
  Object.entries(categories)
    .filter(([key, v]) => v[locale] && getArticles(locale).some((a) => a.category === key))
    .map(([key, v]) => ({ key, ...v[locale]! }));

/* ---------- static pages ---------- */
export function getPage(name: string, locale: Locale) {
  const file = path.join(ROOT, "pages", locale, `${name}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { title: String(data.title), description: String(data.description), body: content };
}

/** Resorts shown in "Where we ride". Visible in production only once site.serviceArea is confirmed. */
const PlacesSchema = z.array(z.object({ name: LText, text: LText, image: z.string() }));
export const places = PlacesSchema.parse(readJson("places.json"));
