import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { IS_PREVIEW } from "./env";

const ROOT = path.join(process.cwd(), "content");
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

/* ---------- shared ---------- */
const LText = z.object({ ru: z.string(), en: z.string().optional(), kk: z.string().optional() });
const LList = z.object({ ru: z.array(z.string()), en: z.array(z.string()).optional(), kk: z.array(z.string()).optional() });
export type LText = z.infer<typeof LText>;

/** Field that may be unknown yet. `value` null means "not confirmed"; `todo` says what to ask the owner. */
const Pending = <T extends z.ZodTypeAny>(t: T) => z.object({ value: t.nullable(), todo: z.string().nullable().optional() });
const Level = z.enum(["beginner", "intermediate", "advanced"]);
export type Level = z.infer<typeof Level>;
const Status = z.enum(["demo", "confirmed", "hidden"]);

export function t<T>(v: { ru: T; en?: T; kk?: T } | null | undefined, locale: Locale): T | undefined {
  if (!v) return undefined;
  return (v as Record<string, T | undefined>)[locale];
}

/* ---------- media ---------- */
const Media = z.record(z.string(), z.any());
export type Img = { src: string; width: number; height: number; alt: Partial<Record<Locale, string>> };
const media = Media.parse(readJson("media.json")) as Record<string, Img>;
export function img(id: string): Img {
  const m = media[id];
  if (!m || typeof m !== "object" || !("src" in m)) throw new Error(`Unknown image id "${id}" (content/media.json)`);
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
  summary: LText,
  body: LList,
  levels: z.array(Level),
  format: z.enum(["private", "group", "both"]),
  image: z.string(),
  todo: z.array(z.string()).default([]),
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
  groupSize: z.object({ min: z.number().nullable(), max: z.number().nullable(), todo: z.string().optional() }),
  season: Pending(LText),
  /** "request": no live calendar, visitors request availability. Only set "live" with a connected booking system. */
  availability: z.enum(["request", "live"]).default("request"),
  price: z.object({ amount: z.number().nullable(), currency: z.string().default("KZT"), unit: z.enum(["person", "group"]).nullable(), todo: z.string().optional() }),
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
});
export type Tour = z.infer<typeof TourSchema>;

function loadDir<S extends z.ZodTypeAny>(dir: string, schema: S): z.infer<S>[] {
  const full = path.join(ROOT, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const parsed = schema.safeParse(JSON.parse(fs.readFileSync(path.join(full, f), "utf8")));
      if (!parsed.success) throw new Error(`content/${dir}/${f}: ${parsed.error.message}`);
      return parsed.data as z.infer<S>;
    });
}

/** Demo items exist only in preview mode. Hidden items never render. */
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
const faq = FaqSchema.parse(readJson("faq.json"));
/** Unconfirmed answers are never shown publicly; in preview they appear as TODO items. */
export const getFaq = (locale: Locale) => faq.filter((f) => (f.confirmed || IS_PREVIEW) && t(f.q, locale));

/* ---------- articles ---------- */
const Source = z.object({ title: z.string(), url: z.string().url().nullable(), checked: z.string().nullable() });
const ArticleMeta = z.object({
  title: z.string(),
  description: z.string(),
  translationKey: z.string(),
  category: z.string(),
  status: z.enum(["draft", "published"]),
  author: z.string().nullable(),
  reviewer: z.string().nullable(),
  published: z.string(),
  updated: z.string(),
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
      const parsed = ArticleMeta.safeParse(data);
      if (!parsed.success) throw new Error(`content/articles/${locale}/${f}: ${parsed.error.message}`);
      return { ...parsed.data, slug: f.replace(/\.md$/, ""), locale, body: content };
    });
}

export function getArticles(locale: Locale): Article[] {
  return loadArticles(locale)
    .filter((a) => a.status === "published" || IS_PREVIEW)
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
