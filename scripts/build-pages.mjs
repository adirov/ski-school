// Static build for GitHub Pages: `NEXT_PUBLIC_BASE_PATH=/repo NEXT_PUBLIC_SITE_URL=https://user.github.io/repo npm run build:pages`
// API routes need a server, so they are moved aside for the build and restored afterwards.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const api = "src/app/api", parked = ".api-parked";
if (existsSync(parked)) throw new Error(`${parked} exists: restore it to ${api} first.`);
renameSync(api, parked);
try {
  execSync("next build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: "1" } });
} finally {
  renameSync(parked, api);
}

const redirectPage = (to) =>
  `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Almaty Snowboard</title><link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}"><a href="${to}">${to}</a>`;
writeFileSync("out/index.html", redirectPage(`${base}/ru/`));
for (const r of JSON.parse(readFileSync("content/redirects.json", "utf8"))) {
  const file = join("out", r.source, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, redirectPage(base + r.destination));
}
// Pages that call notFound() (e.g. /team/ without team data) are exported as HTML with status 200 on static hosts.
// Remove them so GitHub Pages serves the real 404.html instead.
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
for (const f of walk("out").filter((f) => f.endsWith("index.html"))) {
  if (readFileSync(f, "utf8").includes("NEXT_HTTP_ERROR_FALLBACK;404")) rmSync(dirname(f), { recursive: true });
}
writeFileSync("out/.nojekyll", "");
console.log(`Static site in out/ (base path "${base || "/"}")`);
