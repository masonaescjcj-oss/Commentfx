import type { Metadata } from 'next';
import { MEME_WEIGHTS, MEME_LABELS, ageLabel, checkName, type MemeKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { memecoinRadar, MIN_LIQUIDITY_USD, fmtUsd, fmtPct } from '@/lib/market';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Meter, Tag } from '@/components/primitives';
import { RankingIntro } from '@/components/ranking';
import { Unavailable, Freshness } from '@/components/Unavailable';

const TITLE = 'Memecoin safety radar';
const DESC =
  'New Solana pools with real liquidity, each checked against an automated ' +
  'contract audit. Sorted by what the deployer can still do to you — not by price.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/memecoins' });

/** New pools turn over in minutes; five is as stale as this may get. */
export const revalidate = 300;

const FAQ = [
  {
    q: 'What does the safety score measure?',
    a: 'Four things: what powers the deployer kept (45%), how much liquidity is actually in the pool (25%), any transfer tax or fee (15%), and whether trading is genuinely two-sided (15%). It is a contract and market-structure check. It is not a prediction, and it says nothing about whether a token will go up.',
  },
  {
    q: 'Why do some findings cap the score outright?',
    a: 'Two do: a blocked sell path, and an authority that can rewrite holder balances. No amount of liquidity or volume compensates for either, so they cap the headline number rather than being averaged away.',
  },
  {
    q: 'Why are so few tokens listed?',
    a: `Two filters. Pools below $${MIN_LIQUIDITY_USD.toLocaleString('en-US')} of liquidity are not indexed at all, and any token the security upstream has not indexed yet is dropped rather than shown as unknown. A radar that lists tokens it could not check is worse than one that lists fewer.`,
  },
  {
    q: 'Why do you rewrite some token names?',
    a: 'Because some are crafted to deceive. A name can carry an invisible right-to-left override that makes it render as something it is not, or swap a Latin letter for an identical-looking Cyrillic one to impersonate a known token. Names are stripped of invisible characters before they reach the page, mixed alphabets are flagged, and a hidden-character name caps the score outright.',
  },
  {
    q: 'Can a high score still go to zero?',
    a: 'Yes, easily. A clean contract with deep liquidity can still be abandoned, dumped by its largest holders, or simply fail. The score tells you what can be checked automatically, which is a floor, not a recommendation.',
  },
];

export default async function MemecoinsPage() {
  const data = await memecoinRadar('solana');
  const trail = [{ name: 'Home', path: '/' }, { name: 'Memecoins', path: '/memecoins' }];

  return (
    <>
      <Header active="/memecoins" />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />
        <RankingIntro title={TITLE} />

        <Card className="p-4 bg-warn-bg shadow-none border border-[#F3E3C2]">
          <h2 className="text-[14px] font-bold text-warn mb-[6px]">A safety score is not a buy signal</h2>
          <p className="text-[12.5px] text-[#8A6420] leading-[1.8]">
            An automated check of the contract and the pool. A token scoring well can
            still go to zero within hours.
          </p>
        </Card>

        {'error' in data ? (
          <Unavailable
            what="The radar"
            reason={data.error}
            /* No link elsewhere here, unlike the coin pages. The value of this
               page is the screening, and the upstream's own list is every new
               pool unscreened — sending a reader there during an outage would
               be handing them exactly what this page exists to filter. */
          />
        ) : data.tokens.length === 0 ? (
          <Card className="p-5 text-center">
            <p className="text-[14px] font-semibold mb-1">No token passed screening right now</p>
            <p className="text-[12.5px] text-ink-2 leading-[1.8] max-w-[42ch] mx-auto">
              {data.screened} new pools were checked; none currently holds at least
              ${MIN_LIQUIDITY_USD.toLocaleString('en-US')} of liquidity. This is normal
              during quiet hours.
            </p>
          </Card>
        ) : (
          <>
            <Card className="px-4">
              {data.tokens.map(({ input: t, score, dex }) => {
                const tone = score.total >= 7.5 ? 'good' : score.total >= 5 ? 'warn' : 'bad';
                const up = (t.change24hPct ?? 0) >= 0;
                // Never render a token name as supplied: it may carry bidi
                // controls that reorder the page, or homograph letters that
                // impersonate another token.
                const name = checkName(t.name);
                return (
                  <article key={t.tokenAddress} className="py-[14px] border-b border-line-2 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-bold truncate">{name.clean}</h3>
                      <Tag>{ageLabel(t.ageHours)} old</Tag>
                      <div className="flex-1" />
                      <span className={`text-[11.5px] font-bold tnum ${up ? 'text-up' : 'text-down'}`}>
                        {fmtPct(t.change24hPct)}
                      </span>
                    </div>

                    <div className="flex items-center gap-[9px] my-[9px] bg-card-2 rounded-[10px] px-[11px] py-2">
                      <span className="text-[11.5px] text-ink-3 shrink-0">Safety</span>
                      <div className="flex-1">
                        <Meter value={score.total} tone={tone === 'good' ? 'up' : tone === 'warn' ? 'warn' : 'brass'} />
                      </div>
                      <span className={`text-[13px] font-extrabold tnum shrink-0 ${
                        tone === 'good' ? 'text-up' : tone === 'warn' ? 'text-warn' : 'text-down'}`}>
                        {score.total.toFixed(1)}
                      </span>
                    </div>

                    {score.disqualified && (
                      <p className="mb-2"><Tag tone="bad">{score.disqualified}</Tag></p>
                    )}
                    {!score.disqualified && name.mixedScripts && (
                      <p className="mb-2">
                        <Tag tone="warn">Name mixes {name.mixedScripts.join(' and ')} letters</Tag>
                      </p>
                    )}

                    <div className="flex gap-[5px] flex-wrap mb-2">
                      <Tag tone="neutral">Liquidity <b className="tnum">{fmtUsd(t.liquidityUsd)}</b></Tag>
                      <Tag tone="neutral">Buyers 24h <b className="tnum">{t.buyers24h ?? 0}</b></Tag>
                      {dex && <Tag tone="neutral">{dex}</Tag>}
                    </div>

                    <ul className="flex gap-[5px] flex-wrap">
                      {[
                        ['Mintable', t.security.mintable],
                        ['Freezable', t.security.freezable],
                        ['Balance mutable', t.security.balanceMutable],
                        ['Transfer controlled', t.security.transferControlled],
                      ].map(([label, bad]) =>
                        bad === null ? null : (
                          <li key={label as string}>
                            <Tag tone={bad ? 'bad' : 'good'}>
                              {bad ? '✕' : '✓'} {label as string}
                            </Tag>
                          </li>
                        ),
                      )}
                    </ul>
                  </article>
                );
              })}
            </Card>

            <p className="text-[11.5px] text-ink-3 gutter leading-[1.7]">
              {data.screened} new pools screened · {data.tokens.length} met the liquidity
              floor and returned an audit
              {data.dropped > 0 && ` · ${data.dropped} dropped because the security upstream had not indexed them`}
            </p>
            <Freshness at={data.at} source="GeckoTerminal and GoPlus" />
          </>
        )}

        <Card className="p-4">
          <CardHead title="How the safety score is built" href="/methodology" hrefLabel="Full method" />
          <ul className="flex flex-col gap-[10px]">
            {(Object.keys(MEME_WEIGHTS) as MemeKey[]).map((k) => (
              <li key={k}>
                <div className="flex items-baseline gap-2 mb-[6px]">
                  <span className="text-[12.5px]">{MEME_LABELS[k]}</span>
                  <div className="flex-1" />
                  <span className="text-[11.5px] text-ink-3 font-bold tnum">{Math.round(MEME_WEIGHTS[k] * 100)}%</span>
                </div>
                <Meter value={MEME_WEIGHTS[k] * 100} max={45} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Common questions" />
          <dl>
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-3 border-b border-line-2 last:border-b-0">
                <dt className="text-[13.5px] font-semibold mb-[5px]">{q}</dt>
                <dd className="text-[12.5px] text-ink-2 leading-[1.8]">{a}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), faqLd(FAQ)]} />
    </>
  );
}
