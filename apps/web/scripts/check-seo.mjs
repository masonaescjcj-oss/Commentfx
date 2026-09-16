/**
 * Holds every machine-readable claim a page makes about itself to the truth.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web check:seo
 *
 * These are the parts of a page nobody looks at, which is the whole reason they
 * rot: a title nobody reads twice, a canonical pointing at the wrong URL, a
 * structured-data block that stopped parsing. Each one is invisible in a
 * browser and load-bearing everywhere else.
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

/**
 * Which prerendered routes are pages.
 *
 * This asked the filename, with a list of extensions that were not pages, and
 * the list was wrong the first time something new was added: a favicon at
 * /icon.svg is a prerendered route, is not .xml or .txt, and was duly required
 * to have one h1, a title and a description. Asking the response what it is
 * costs one HEAD per route and cannot go stale.
 */
const built = [];
for (const route of Object.keys(manifest.routes)) {
  if (route.startsWith('/_')) continue;
  const res = await fetch(BASE + route, { method: 'HEAD' });
  if ((res.headers.get('content-type') ?? '').startsWith('text/html')) built.push(route);
}

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

// ── Every internal link goes somewhere ───────────────────────────────────────
// Two dead ones shipped once — /news and /search, neither of which existed —
// and they were found by a person clicking them. Nothing stopped the next pair.
// A sitemap entry that 404s and a link that 404s are different failures: the
// first wastes a crawl, the second is a reader hitting a wall.
const linkedFrom = new Map();
for (const path of built) {
  const html = await (await fetch(BASE + path)).text();
  for (const [, href] of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const to = href.replace(/\?.*$/, '') || '/';
    if (/^\/_next\//.test(to)) continue;
    if (!linkedFrom.has(to)) linkedFrom.set(to, path);
  }
}

const dangling = [];
for (const [to, from] of linkedFrom) {
  const res = await fetch(BASE + to, { redirect: 'manual' });
  if (res.status !== 200) dangling.push(`${to} → HTTP ${res.status}, linked from ${from}`);
}
if (dangling.length) listed('every internal link goes somewhere', dangling);
else check('every internal link goes somewhere', true, `${linkedFrom.size} distinct targets`);

// ── And the page for everything else ─────────────────────────────────────────
// A URL we do not have must answer 404 and still be a page. Answering 200 with
// "not found" on it is a soft 404: a search engine indexes the apology, and a
// reader gets no way back. Both halves are asserted because both were once
// wrong — the status was right and the page was Next's own black-on-white
// default, with no header on it.
{
  const res = await fetch(`${BASE}/a-url-this-site-does-not-have-9f2a`);
  const html = await res.text();
  check('an unknown URL answers 404', res.status === 404, `HTTP ${res.status}`);
  check('and is still a page of this site', html.includes('CommentFX') && /<header/.test(html));
  check('and offers a way out', (html.match(/href="\/[a-z]/g) ?? []).length >= 4);
  check('and asks not to be indexed', /<meta name="robots" content="[^"]*noindex/.test(html));
}

// ── What each page says about itself ─────────────────────────────────────────
const titles = new Map();
const descriptions = new Map();
const problems = { h1: [], title: [], description: [], ld: [] };

/** Nodes in a JSON-LD block, whether it uses @graph or not. */
const nodes = (parsed) => (Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed]);

for (const path of built) {
  const html = await (await fetch(BASE + path)).text();

  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) problems.h1.push(`${path} has ${h1s}`);

  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim();
  if (!title) problems.title.push(`${path} has none`);
  else (titles.get(title) ?? titles.set(title, []).get(title)).push(path);

  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1]?.trim();
  if (!desc) problems.description.push(`${path} has none`);
  else (descriptions.get(desc) ?? descriptions.set(desc, []).get(desc)).push(path);

  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      problems.ld.push(`${path}: does not parse — ${err.message}`);
      continue;
    }
    if (!parsed['@context']) problems.ld.push(`${path}: a block with no @context`);

    for (const node of nodes(parsed)) {
      if (!node['@type']) { problems.ld.push(`${path}: a node with no @type`); continue; }

      // A breadcrumb with a gap in its positions is not a breadcrumb.
      if (node['@type'] === 'BreadcrumbList') {
        const items = node.itemListElement ?? [];
        const positions = items.map((i) => i.position);
        if (positions.some((pos, n) => pos !== n + 1))
          problems.ld.push(`${path}: breadcrumb positions are ${positions.join(',')}`);
        for (const i of items) {
          if (!i.name) problems.ld.push(`${path}: a breadcrumb step with no name`);
          if (!String(i.item ?? '').startsWith('http'))
            problems.ld.push(`${path}: breadcrumb "${i.name}" points at "${i.item}"`);
        }
      }

      // An answer that renders as "undefined" is worse than no FAQ at all: it
      // is a claim, published, in a format built to be quoted back verbatim.
      if (node['@type'] === 'FAQPage') {
        for (const q of node.mainEntity ?? []) {
          const a = q.acceptedAnswer?.text ?? '';
          if (!q.name) problems.ld.push(`${path}: a question with no text`);
          if (!a) problems.ld.push(`${path}: "${q.name}" has no answer`);
          if (/\bundefined\b|\bNaN\b|\bnull\b/.test(`${q.name} ${a}`))
            problems.ld.push(`${path}: "${q.name}" answers with a missing value`);
        }
      }
    }
  }
}

const dupes = (m) => [...m.entries()].filter(([, paths]) => paths.length > 1);
const listProblems = (label, items) => (items.length ? listed(label, items) : check(label, true));

listProblems('every page has exactly one h1', problems.h1);
listProblems('every page has a title', problems.title);
listProblems('every page has a description', problems.description);
listProblems('no two pages share a title', dupes(titles).map(([t, p]) => `${p.length}× "${t.slice(0, 60)}"`));
listProblems('no two pages share a description', dupes(descriptions).map(([d, p]) => `${p.length}× "${d.slice(0, 60)}…"`));
listProblems('every structured-data block is well formed', problems.ld);

console.log(failures.length ? `\n${failures.length} failed` : '\nall clear');
process.exit(failures.length ? 1 : 0);
