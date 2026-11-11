import { publishedLocales } from "@/i18n/config";
import { getArticles, getFaq, getServices, site, t, factVisible } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-text summary of the school for AI assistants and AI search (GEO).
 * Built from the same confirmed facts as the pages, so it never says more than the site does.
 */
export async function GET() {
  const c = site.contacts;
  const lines: string[] = [`# ${site.brand.name}`, "", `> ${site.brand.shortDescription.en}`, "", site.brand.shortDescription.ru, ""];
  const contact: string[] = [];
  if (factVisible(c.person) && c.person.confirmed) contact.push(`- Contact person: ${c.person.value.en} (${c.person.value.ru})`);
  if (factVisible(c.phone) && c.phone.confirmed) contact.push(`- Phone: ${c.phone.display}`);
  if (factVisible(c.whatsapp) && c.whatsapp.confirmed) contact.push(`- WhatsApp: https://wa.me/${String(c.whatsapp.value).replace(/\D/g, "")}`);
  if (site.serviceArea.confirmed && site.serviceArea.value) contact.push(`- Area: ${site.serviceArea.value.en.join(", ")}`);
  contact.push("- Prices and dates: on request (the site does not publish prices).");
  lines.push("## Contacts", ...contact, "");
  for (const locale of publishedLocales) {
    const label = locale === "ru" ? "Русский" : "English";
    lines.push(`## Services (${label})`);
    for (const s of getServices(locale)) lines.push(`- [${t(s.title, locale)}](${SITE_URL}/${locale}/services/${s.slug}/): ${t(s.summary, locale)}`);
    lines.push("");
    const arts = getArticles(locale);
    if (arts.length) {
      lines.push(`## Guides (${label})`);
      for (const a of arts) lines.push(`- [${a.title}](${SITE_URL}/${locale}/guides/${a.slug}/): ${a.description}`);
      lines.push("");
    }
    const faq = getFaq(locale).filter((f) => f.confirmed && t(f.a, locale));
    if (faq.length) {
      lines.push(`## FAQ (${label})`, `Full list: ${SITE_URL}/${locale}/faq/`);
      for (const f of faq) lines.push(`- Q: ${t(f.q, locale)}`, `  A: ${t(f.a, locale)}`);
      lines.push("");
    }
  }
  if (site.partner) {
    lines.push("## Partner", `Airport transfers and sightseeing tours: travel agency ${site.partner.name} (${site.partner.links.transfer.en}, ${site.partner.links.tours.en}).`, "");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
