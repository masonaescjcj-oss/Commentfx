import type { Broker } from './types.ts';
import type { PropFirm } from './props.ts';
import type { Exchange } from './exchanges.ts';

/**
 * Which of our pages belong in a search index, and why.
 *
 * One module, read by three things that would otherwise drift apart: the
 * sitemap, the robots meta on the page itself, and the test below. A page that
 * is in the sitemap and carries noindex is a contradiction Google reports as an
 * error; a page that is indexable and missing from the sitemap is a page nobody
 * finds. They cannot disagree if they ask the same function.
 *
 * The reasoning, at length, is in docs/SEO.md. The short version:
 *
 * Google does not penalise publishing many pages at once — their own advocate
 * says trickling them out "often causes more problems than it solves". What it
 * penalises is *scaled content abuse*: "many pages… generated for the primary
 * purpose of manipulating search rankings and not helping users", where the
 * test is value per page and not pages per day. A new domain also has very
 * little crawl demand, so the pages we do publish are competing with each other
 * for the small amount of attention we get.
 *
 * Both of those point the same way: publish everything, index only what earns
 * it. A page that fails the gate is still served, still linked and still
 * crawlable — `noindex, follow`, so the links on it still carry through to the
 * pages that are indexed. It simply does not stand in the queue.
 */
export type IndexDecision =
  | { indexable: true }
  | { indexable: false; reason: string };

export const INDEXABLE: IndexDecision = { indexable: true };
const no = (reason: string): IndexDecision => ({ indexable: false, reason });

/**
 * A page can carry a release date, and is held back until it passes.
 *
 * This is the staged rollout, for when a batch is deliberately kept back. It is
 * off by default and should stay off for anything already written: holding a
 * good page back buys nothing, and the gate above is what actually protects the
 * site's average.
 */
export const releasedBy = (releaseAt: string | null | undefined, now = new Date()): IndexDecision =>
  releaseAt && new Date(releaseAt) > now ? no(`not released until ${releaseAt}`) : INDEXABLE;

/* ── Records ───────────────────────────────────────────────────────────── */

/**
 * A record page is the product, so the floor is about completeness rather than
 * length: a company we cannot say who licenses or what it costs is a company
 * whose page has nothing on it that the company's own site does not.
 */
export function brokerIndexable(b: Broker): IndexDecision {
  if (b.entities.length === 0) return no('no licensed entity on the record');
  if (!b.entities.some((e) => e.licence.number)) return no('no licence number on any entity');
  if (b.cost.eurusdSpread === null || b.cost.eurusdSpread === undefined) return no('no published cost');
  return INDEXABLE;
}

export function propIndexable(f: PropFirm): IndexDecision {
  if (!f.rules.drawdownType) return no('no drawdown rule on the record');
  if (!f.feeUsdPer100k) return no('no challenge fee on the record');
  return INDEXABLE;
}

export function exchangeIndexable(e: Exchange): IndexDecision {
  if (e.takerFeePct === null || e.takerFeePct === undefined) return no('no taker fee on the record');
  if (!e.spotVolumeUsd) return no('no volume on the record');
  return INDEXABLE;
}

/**
 * A comparison is worth indexing when both sides are, and not otherwise: half a
 * comparison is a page that answers its own title with a shrug.
 */
export function compareIndexable(a: Broker, b: Broker): IndexDecision {
  const left = brokerIndexable(a);
  const right = brokerIndexable(b);
  if (!left.indexable) return no(`${a.name}: ${left.reason}`);
  if (!right.indexable) return no(`${b.name}: ${right.reason}`);
  return INDEXABLE;
}

/**
 * Coin pages are not indexed, and this is the single biggest decision in the
 * file.
 *
 * There are a hundred of them against seventy-eight pages that are actually
 * ours, and what they carry — a price, a change, a sparkline — is carried
 * better, live, by CoinGecko and CoinMarketCap, who own these queries and have
 * the data we are reading from them. We cannot win `bitcoin price`. What we can
 * lose is the ratio: a new domain whose index is 56% pages that restate a third
 * party's numbers is a domain Google has every reason to crawl slowly.
 *
 * They stay on the site. They are linked, crawlable, and useful to somebody
 * already here. They do not compete.
 */
export const coinIndexable = (): IndexDecision =>
  no('a price page cannot beat the source of the price');

/** A tool is not a document: nothing to index, and nothing lost by saying so. */
export const UTILITY_PATHS = ['/search', '/reviews/withdraw', '/admin'] as const;

export const pathIndexable = (path: string): IndexDecision =>
  UTILITY_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
    ? no('a tool, not a document')
    : INDEXABLE;
