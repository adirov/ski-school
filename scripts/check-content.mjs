// Prints every TODO / unconfirmed item in content/ as one list for the owner.
// Run: npm run check:content
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "content");
const out = [];
const walk = (obj, where) => {
  if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (obj && typeof obj === "object") {
    if ("confirmed" in obj && obj.confirmed === false && obj.todo) out.push(`${where}: ${obj.todo}`);
    else if ("todo" in obj && typeof obj.todo === "string" && ("value" in obj ? obj.value == null : true)) out.push(`${where}: ${obj.todo}`);
    for (const [k, v] of Object.entries(obj)) if (k !== "todo") walk(v, `${where}.${k}`);
  }
};
for (const f of ["site.json", "faq.json"]) walk(JSON.parse(fs.readFileSync(path.join(root, f), "utf8")), f);
for (const dir of ["services", "tours"]) {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    const j = JSON.parse(fs.readFileSync(path.join(root, dir, f), "utf8"));
    if (j.status === "trash") continue;
    if (j.status === "demo") out.push(`${dir}/${f}: статус demo, нужно подтверждение владельцем`);
    for (const t of j.todo ?? []) out.push(`${dir}/${f}: ${t}`);
    walk({ ...j, todo: undefined }, `${dir}/${f}`);
  }
}
for (const l of fs.readdirSync(path.join(root, "articles"))) {
  for (const f of fs.readdirSync(path.join(root, "articles", l))) {
    const s = fs.readFileSync(path.join(root, "articles", l, f), "utf8");
    if (/^status:\s*["']?trash/m.test(s)) continue;
    if (/^status:\s*["']?draft/m.test(s)) out.push(`articles/${l}/${f}: черновик`);
    for (const m of s.matchAll(/^\s+- "(.+)"$/gm)) if (s.indexOf("todo:") < m.index) out.push(`articles/${l}/${f}: ${m[1]}`);
  }
}
console.log(out.map((s) => `- ${s}`).join("\n"));
console.log(`\nВсего: ${out.length}`);
