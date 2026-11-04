import { Marked, type Tokens } from "marked";
import { BASE_PATH } from "./env";

export type TocItem = { id: string; text: string; depth: number };

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "q", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .split("")
    .map((c) => translit[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const plain = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();

/** Renders article Markdown to HTML with stable heading ids and a table of contents (h2/h3). */
export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        let id = slugify(plain(inner)) || "section";
        while (used.has(id)) id += "-2";
        used.add(id);
        if (token.depth === 2 || token.depth === 3) toc.push({ id, text: plain(inner), depth: token.depth });
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
      table(this: unknown, token: Tokens.Table) {
        const head = token.header.map((c) => `<th scope="col">${marked.parseInline(c.text)}</th>`).join("");
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${marked.parseInline(c.text)}</td>`).join("")}</tr>`).join("");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });
  // Site-absolute links in content ("/ru/contact/") must carry the deploy sub-path (GitHub Pages).
  const html = (marked.parse(md, { async: false }) as string).replace(/href="\/(?!\/)/g, `href="${BASE_PATH}/`);
  return { html, toc };
}

export function excerptText(md: string) {
  return md.replace(/[#>*_`|\-\[\]()]/g, " ").replace(/\s+/g, " ").trim();
}
