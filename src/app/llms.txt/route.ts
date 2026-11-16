import { publishedLocales } from "@/i18n/config";
import { getArticles, getFaq, getServices, site, t, factVisible, prices, places, priceGroupFor, hoursLabel } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-text summary of the school for AI assistants and AI search (GEO).
 * Built from the same confirmed facts as the pages, so it never says more than the site does.
 */
export async function GET() {
  const c = site.contacts;
  const en = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} KZT`;
  const lines: string[] = [`# ${site.brand.name}`, "", `> ${site.brand.shortDescription.en}`, "", site.brand.shortDescription.ru, ""];
  // Canonical identity first: assistants confuse the school with the partner travel agency.
  lines.push(
    `Official website of ${site.brand.name}: ${SITE_URL}/ (Russian: ${SITE_URL}/ru/, English: ${SITE_URL}/en/).` +
      (site.partner ? ` ${site.partner.name} is a partner travel agency (airport transfers, tours); snowboard lessons are booked directly with the school.` : ""),
    "",
  );
  const facts: string[] = [];
  if (site.brand.foundedNote.confirmed) facts.push("- Founded: 2005 (teaching snowboarding in Almaty since 2005)");
  if (site.brand.credentialsNote.confirmed) facts.push("- Certified instructors");
  if (site.brand.experienceNote?.confirmed) facts.push("- Instructors have 10 to 40 years of experience");
  if (site.placesConfirmed && places.length) facts.push(`- Resorts where lessons take place: ${places.map((p) => `${p.name.en} (${p.name.ru})`).join(", ")}`);
  if (site.serviceArea.confirmed && site.serviceArea.value) facts.push(`- Area: ${site.serviceArea.value.en.join(", ")}`);
  for (const s of getServices("en")) {
    if (priceGroupFor(s.slug)) continue;
    facts.push(`- ${t(s.title, "en")}: ${[t(s.age, "en"), t(s.duration, "en")].filter(Boolean).join(", ")}; price on request by phone/WhatsApp`);
  }
  facts.push("- Rental gear: instructors help you choose it at the resort rental shop; rental is paid separately");
  facts.push(`- Ski pass: not included; guests buy a half-day or full-day pass at the resort ticket office`);
  lines.push("## Key facts", ...facts, "");
  const contact: string[] = [];
  if (factVisible(c.person) && c.person.confirmed) contact.push(`- Contact person: ${c.person.value.en} (${c.person.value.ru})`);
  if (factVisible(c.phone) && c.phone.confirmed) contact.push(`- Phone: ${c.phone.display}`);
  if (factVisible(c.whatsapp) && c.whatsapp.confirmed) contact.push(`- WhatsApp: https://wa.me/${String(c.whatsapp.value).replace(/\D/g, "")}`);
  if (factVisible(c.phone) && c.phone.confirmed) contact.push(`- Booking: phone/WhatsApp ${c.phone.display}; available dates are confirmed in reply.`);
  contact.push(`- Prices: ${SITE_URL}/en/prices/ (RU: ${SITE_URL}/ru/prices/)`);
  lines.push("## Contacts", ...contact, "");
  lines.push(`## Prices (KZT, updated ${prices.updated})`);
  for (const g of prices.groups) {
    lines.push(`### ${g.title.en}${g.note?.en ? ` (${g.note.en})` : ""}`);
    for (const it of g.items) lines.push(`- ${it.name.en}${it.days === "weekday" ? ", weekdays Mon-Fri" : it.days === "weekend" ? ", weekends Sat-Sun" : ""}, ${hoursLabel(it.hours, "en")}: ${en(it.price)} ${it.unit === "person" ? "per person" : "per lesson"}`);
  }
  lines.push(`- ${prices.notIncluded.en}`, "");
  for (const locale of publishedLocales) {
    const label = locale === "ru" ? "Русский" : "English";
    lines.push(`## Services (${label})`);
    for (const s of getServices(locale)) lines.push(`- [${t(s.title, locale)}](${SITE_URL}/${locale}/services/${s.slug}/): ${t(s.seo?.description, locale) || t(s.summary, locale)}`);
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
