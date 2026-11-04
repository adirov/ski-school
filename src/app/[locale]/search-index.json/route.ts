import { NextResponse } from "next/server";
import { publishedLocales, type Locale } from "@/i18n/config";
import { getArticles } from "@/lib/content";
import { excerptText } from "@/lib/markdown";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return publishedLocales.map((locale) => ({ locale }));
}

/** Static JSON index for the guide search, generated at build time. */
export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const items = getArticles(locale).map((a) => ({
    title: a.title,
    description: a.description,
    href: `/${locale}/guides/${a.slug}/`,
    category: a.category,
    text: excerptText(`${a.answer} ${a.body}`).slice(0, 6000),
  }));
  return NextResponse.json(items, { headers: { "X-Robots-Tag": "noindex" } });
}
