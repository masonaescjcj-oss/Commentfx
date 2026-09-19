/**
 * Tell Bing the site changed, instead of waiting to be asked.
 *
 *   pnpm --filter @commentfx/web indexnow                  # everything in the sitemap
 *   pnpm --filter @commentfx/web indexnow /learn/x /props  # just these
 *
 * IndexNow is Microsoft's push protocol: a site says "these URLs changed" and
 * the engines that implement it fetch them rather than discovering the change
 * on their own schedule. Bing and Yandex implement it; Google does not, and
 * says so, so this is not a Google lever and is not pretended to be one.
 *
 * It matters here more than the name suggests. Yahoo Search is Bing's index
 * with Yahoo's front end, and ChatGPT's browsing path queries Bing — so the one
 * thing being pushed to is the thing three different surfaces read. A ranking
 * site whose numbers move is exactly the case the protocol was written for: the
 * page is the same URL every week and its contents are not.
 *
 * The key is public by design. It is not a credential — it proves only that
 * whoever is submitting controls the host, because the engine fetches
 * https://<host>/<key>.txt and checks it says the same thing. Committing it is
 * correct; hiding it would break the check.
 *
 * Exits non-zero if the endpoint refuses, so a deploy script can notice.
 */
const SITE = process.env.INDEXNOW_SITE ?? 'https://commentfx.com';
const KEY = 'c4a7c86f8f25fa02b81e437281264fa8';
const HOST = new URL(SITE).host;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const given = process.argv.slice(2).filter((a) => !a.startsWith('-'));

/** Every URL the site itself says it has. The sitemap is generated, so this
 *  cannot drift from what is actually published. */
async function fromSitemap() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap answered ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urlList = given.length
  ? given.map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`))
  : await fromSitemap();

if (urlList.length === 0) {
  console.error('Nothing to submit.');
  process.exit(1);
}

// Submitting a URL that 404s is how a host gets its key rejected, so every one
// is checked first. The sitemap is generated from the data and should never
// contain a dead URL — which is the reason to look rather than to assume.
const dead = [];
for (const u of urlList) {
  const res = await fetch(u, { method: 'HEAD', redirect: 'manual' });
  if (res.status >= 400) dead.push(`${u} → ${res.status}`);
}
if (dead.length) {
  console.error(`${dead.length} of ${urlList.length} do not serve, so nothing was submitted:`);
  for (const d of dead.slice(0, 10)) console.error(`  ${d}`);
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});

const body = await res.text();

// 200 accepted, 202 accepted but the key is still being verified — both fine.
if (res.status === 200 || res.status === 202) {
  console.log(`Submitted ${urlList.length} url${urlList.length === 1 ? '' : 's'} for ${HOST} — HTTP ${res.status}`);
  console.log('Bing, and through it Yahoo. Google does not read this.');
  process.exit(0);
}

console.error(`IndexNow refused: HTTP ${res.status} ${body.slice(0, 300)}`);
// 403 is the one worth naming: it means the key file is not where it says.
if (res.status === 403) console.error(`Check that ${SITE}/${KEY}.txt serves the key and nothing else.`);
process.exit(1);
