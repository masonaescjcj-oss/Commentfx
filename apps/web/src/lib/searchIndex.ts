import { COIN_INDEX, RELEASES, scheduleNoun } from '@commentfx/core';
import {
  rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA, comparePairs, pairSlug, getBroker,
  type ReviewStats,
} from './repo';

export interface SearchEntry {
  path: string;
  title: string;
  /** One line of what the reader gets on that page. */
  note: string;
  group: 'Brokers' | 'Prop firms' | 'Exchanges' | 'Coins' | 'Comparisons' | 'Shortlists' | 'Releases' | 'Site';
  /** Extra words worth matching that are not in the title. */
  terms: string;
  score: number | null;
}

/**
 * The whole site as one list, built from the same data the pages are.
 *
 * It is rendered into the page in full rather than fetched, which keeps search
 * working with no JavaScript and no API, and makes /search an honest directory
 * of everything we publish -- including the pages a reader would otherwise only
 * reach through three clicks of ranking tables.
 */
export function searchIndex(stats?: ReviewStats): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const r of rankedBrokers(stats)) {
    const b = r.broker;
    entries.push({
      path: `/brokers/${b.slug}`,
      title: b.name,
      note: `#${r.rank} broker · ${b.entities.length} licences · ${b.headquarters}`,
      group: 'Brokers',
      terms: `broker forex ${b.entities.map((e) => `${e.licence.regulator} ${e.legalName}`).join(' ')} ${b.platforms.list.join(' ')}`,
      score: r.score.total,
    });
  }

  for (const r of rankedProps()) {
    entries.push({
      path: `/props/${r.firm.slug}`,
      title: r.firm.name,
      note: `#${r.rank} prop firm · ${r.firm.headquarters} · ${r.firm.markets.join(', ')}`,
      group: 'Prop firms',
      terms: `prop firm funded challenge evaluation ${r.firm.platforms.join(' ')}`,
      score: r.score.total,
    });
  }

  for (const r of rankedExchanges()) {
    entries.push({
      path: `/exchanges/${r.exchange.slug}`,
      title: r.exchange.name,
      note: `#${r.rank} exchange · ${r.exchange.headquarters} · ${r.exchange.kind}`,
      group: 'Exchanges',
      terms: 'crypto exchange cex spot futures',
      score: r.score.total,
    });
  }

  /**
   * A hundred coin pages that the site's own search could not find, for the
   * same reason the sitemap could not list them: ids only existed behind a
   * fetch and this function is synchronous. Searching "bitcoin" returned the
   * /coins list and nothing else.
   *
   * Names and tickers only — no price, because this list is rendered into the
   * page and a number in it would be as old as the last deploy.
   */
  for (const c of COIN_INDEX) {
    entries.push({
      path: `/coins/${c.id}`,
      title: c.name,
      note: `${c.symbol} · price, market cap and where to trade it`,
      group: 'Coins',
      terms: `coin crypto token ${c.symbol} ${c.id.replace(/-/g, ' ')} price chart`,
      score: null,
    });
  }

  for (const c of BEST_CRITERIA) {
    entries.push({
      path: `/best/${c.slug}`,
      title: c.title,
      note: c.lead,
      group: 'Shortlists',
      terms: `best top ranking ${c.slug.replace(/-/g, ' ')}`,
      score: null,
    });
  }

  for (const [a, b] of comparePairs()) {
    const left = getBroker(a);
    const right = getBroker(b);
    if (!left || !right) continue;
    entries.push({
      path: `/compare/${pairSlug(a, b)}`,
      title: `${left.name} vs ${right.name}`,
      note: 'Side by side on cost, licences and withdrawal terms',
      group: 'Comparisons',
      terms: `compare versus ${a} ${b}`,
      score: null,
    });
  }

  for (const r of RELEASES) {
    entries.push({
      path: `/calendar/${r.slug}`,
      title: `${r.name} ${scheduleNoun(r)}`,
      note: `Every scheduled date, from the ${r.publisher}`,
      group: 'Releases',
      terms: `calendar release schedule ${r.title} ${r.currency} ${r.aka.join(' ')}`,
      score: null,
    });
  }

  entries.push(
    { path: '/calendar', title: 'Economic calendar', note: 'Release dates and rate decisions from the BLS, the Fed and the ECB', group: 'Site', terms: 'nfp cpi fomc ecb jobs inflation rates news', score: null },
    { path: '/status', title: 'Broker status', note: 'Withdrawal delays and outages reported in the last 24 hours', group: 'Site', terms: 'down outage withdrawal problem incident', score: null },
    { path: '/reviews', title: 'Reviews', note: 'What customers say about every company we rank', group: 'Site', terms: 'reviews complaints experience customers ratings', score: null },
    { path: '/reviews/withdraw', title: 'Withdraw a review', note: 'Take down a review you wrote, with the code you were given', group: 'Site', terms: 'delete remove my review takedown', score: null },
    { path: '/methodology', title: 'How we score', note: 'Every weight, every input, and what we refuse to score', group: 'Site', terms: 'method weights scoring transparency', score: null },
    { path: '/brokers', title: 'All brokers', note: 'The full broker ranking', group: 'Site', terms: 'forex directory list', score: null },
    { path: '/props', title: 'All prop firms', note: 'The full prop firm ranking', group: 'Site', terms: 'funded directory list', score: null },
    { path: '/exchanges', title: 'All exchanges', note: 'The full exchange ranking', group: 'Site', terms: 'crypto directory list', score: null },
    { path: '/coins', title: 'Coins', note: 'Market data for the majors', group: 'Site', terms: 'bitcoin ethereum price market cap', score: null },
    { path: '/memecoins', title: 'Memecoins', note: 'Contract safety checks before the chart', group: 'Site', terms: 'honeypot rug solana token safety', score: null },
  );

  return entries;
}

export const GROUP_ORDER: SearchEntry['group'][] =
  ['Brokers', 'Prop firms', 'Exchanges', 'Coins', 'Comparisons', 'Shortlists', 'Releases', 'Site'];
