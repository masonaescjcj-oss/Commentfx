/**
 * Holds the sitemap to the site.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web check:sitemap
 *
 * The sitemap is generated from the data rather than hand-maintained, which
 * makes it feel self-maintaining and is exactly why nobody looked at it. It was
 * missing every coin page — fifty built, a hundred served, all of them linked
 * from /coins, none of them listed. The site's largest block of pages and its
 * most searched-for ones. The generator is synchronous and coin ids only ever
 * came from a fetch, so they could not be listed and quietly were not.
 *
 * The rule here needs no allowlist, which is what makes it worth running: a page
 * says whether it wants to be indexed, and the sitemap has to agree with it.
 *
 *   indexable  ⟹ in the sitemap
 *   noindex    ⟹ not in the sitemap
 *   listed     ⟹ serves 200, and its canonical points at itself
 *
 * A sitemap entry that 404s or points somewhere else spends crawl budget on
 * nothing and tells a search engine the site does not know its own shape.
 */
import { readFile } from 'node:fs/promises';

const BASE = process.env.CHECK_BASE ?? 'http://127.0.0.1:3000';
const SITE = 'https://commentfx.com';
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const listed = (label, items) => {
  console.log(`FAIL  ${label} — ${items.length}`);
  for (const i of items.slice(0, 15)) console.log(`        ${i}`);
  if (items.length > 15) console.log(`        …and ${items.length - 15} more`);
  failures.push(label);
};

// ── What the sitemap claims ──────────────────────────────────────────────────
const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
// The homepage is listed as the bare origin, because that is the canonical Next
// renders for it and the two have to agree. As a path that is '/'.
const paths = urls.map((u) => u.replace(SITE, '') || '/');
const sitemap = new Set(paths);

check('the sitemap parses and is not empty', urls.length > 0, `${urls.length} urls`);
check('every url is absolute and on this site', urls.every((u) => u === SITE || u.startsWith(`${SITE}/`)));
check('no url is listed twice', sitemap.size === paths.length, `${paths.length - sitemap.size} duplicates`);

// ── What the build emits ─────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'));
const built = Object.keys(manifest.routes).filter((r) => !/\.(xml|txt)$/.test(r) && !r.startsWith('/_'));

// ── Each page says whether it wants indexing, and the sitemap must agree ─────
const NOINDEX = /<meta name="robots" content="[^"]*noindex/;
const missing = [];
const wrongly = [];
for (const path of built) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const noindex = NOINDEX.test(html);
  if (!noindex && !sitemap.has(path)) missing.push(path);
  if (noindex && sitemap.has(path)) wrongly.push(path);
}
if (missing.length) listed('every indexable page is in the sitemap', missing);
else check('every indexable page is in the sitemap', true, `${built.length} checked`);
if (wrongly.length) listed('no noindex page is in the sitemap', wrongly);
else check('no noindex page is in the sitemap', true);

// ── Each listed page serves, and agrees that it is itself ────────────────────
const dead = [];
const mismatched = [];
for (const path of paths) {
  const res = await fetch(BASE + path);
  if (!res.ok) { dead.push(`${path} → HTTP ${res.status}`); continue; }
  const html = await res.text();
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  const expected = path === '/' ? SITE : SITE + path;
  if (canonical && canonical !== expected) mismatched.push(`${path} → ${canonical}`);
}
if (dead.length) listed('every listed page serves', dead);
else check('every listed page serves', true, `${paths.length} checked`);
if (mismatched.length) listed('every listed page is its own canonical', mismatched);
else check('every listed page is its own canonical', true);

console.log(failures.length ? `\n${failures.length} failed` : '\nall clear');
process.exit(failures.length ? 1 : 0);
