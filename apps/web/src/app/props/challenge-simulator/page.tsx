import Link from 'next/link';
import type { Metadata } from 'next';
import { propProfileFor } from '@commentfx/core';
import { rankedProps } from '@/lib/repo';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { Faq } from '@/components/Faq';
import { ChallengeSimulator, type SimFirm } from '@/components/ChallengeSimulator';

/**
 * Prerendered with the defaults, and the attempts are seeded, so the numbers in
 * the HTML are the numbers a browser computes on arrival — a crawler and a
 * reader with scripts off see a real result, and nothing moves when the page
 * comes alive.
 */
export const revalidate = 3600;

const TITLE = 'Prop firm challenge simulator — would you pass?';
const DESC =
  'Pick a prop firm, set your risk, win rate and reward, and play its rules forward a thousand times: '
  + 'how often you pass, what ends the rest, and what the drawdown rule costs.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/props/challenge-simulator' });

const FAQ = [
  {
    q: 'How accurate is the pass rate?',
    a: 'It is exact for the model and approximate for you. The model plays the firm’s published limits against '
      + 'trades that win or lose at the rate you set, independently of each other, with no costs. Real trading '
      + 'has spreads, commissions, slippage and streaks, all of which lower the number.',
  },
  {
    q: 'Why does a trader with no edge still pass about half the time?',
    a: 'Because with no edge the balance wanders, and whether it reaches the target or the floor first depends '
      + 'mostly on how far away each one is. Where the target and the floor are the same distance away, that is '
      + 'close to a coin toss — which is also why the fee is lost the other half of the time.',
  },
  {
    q: 'Why does the daily loss limit rarely end an attempt here?',
    a: 'At low risk and few trades a day, one day cannot lose enough to reach it: two losing trades at 1% risk '
      + 'is 2% against a daily limit of 4% or 5%. Raise the risk or the trades per day and it starts to bite.',
  },
  {
    q: 'Does this include the second phase?',
    a: 'No. It simulates phase one, whose target is the one each firm’s record carries. Two-step firms have a '
      + 'second phase with a lower target and the same limits, which a trader has to survive as well.',
  },
];

export default function ChallengeSimulatorPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Prop Firms', path: '/props' },
    { name: 'Challenge simulator', path: '/props/challenge-simulator' },
  ];
  const firms: SimFirm[] = rankedProps().map(({ firm: f }) => ({
    slug: f.slug,
    name: f.name,
    steps: f.rules.steps,
    readAtOrigin: propProfileFor(f.slug)?.originReadable ?? false,
    rules: {
      targetPct: f.rules.profitTargetPct,
      dailyPct: f.rules.dailyDrawdownPct,
      maxPct: f.rules.maxDrawdownPct,
      drawdown: f.rules.drawdownType,
      minDays: f.rules.minTradingDays,
      timeLimitDays: f.rules.timeLimitDays,
    },
  }));

  return (
    <>
      <Header active="/props" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="Prop firm challenge simulator" trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <Card className="p-4 lg:p-6" as="section">
            <p className="text-[14px] leading-[1.8] text-ink-2 max-w-[68ch]">
              Choose a firm from <Link href="/props" className="text-accent">the prop firm rankings</Link>, describe
              how you trade, and see its rules played forward against a thousand attempts: how many pass, what ends
              the rest, and how the same trades fare under a different drawdown rule. The difference between those
              rules is set out in{' '}
              <Link href="/learn/static-and-trailing-drawdown" className="text-accent">static and trailing drawdown, on the same trades</Link>.
            </p>
          </Card>

          <ChallengeSimulator firms={firms} defaultFirm={firms[0]!.slug} />

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="What this models, and what it leaves out" />
            <ul className="flex flex-col gap-[10px] max-w-[68ch]">
              {[
                'Each trade risks a fixed share of the starting balance, and wins or loses independently at the rate you set.',
                'A losing trade first moves in your favour by up to half its target before it reverses. That only matters to an intraday trailing floor, which follows it up — the trap that design sets.',
                'The daily limit is measured from the day’s opening balance. Some firms measure from equity or the initial balance.',
                'Trailing floors here never stop rising. Some firms stop theirs at the starting balance; that is in their terms or it does not exist.',
                'Left out: spreads, commissions and slippage; streaks beyond chance; news gaps; consistency rules; and the second phase of two-step firms. Each of them lowers the pass rate.',
              ].map((t) => (
                <li key={t} className="text-[13.5px] leading-[1.75] text-ink-2 pl-5 relative">
                  <span aria-hidden className="absolute left-0 top-[10px] w-[6px] h-[6px] rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] leading-[1.75] text-ink-3 mt-4 max-w-[68ch]">
              A simulation shows what a set of rules does to a way of trading. It is not a forecast of anybody’s
              result, and a high number here is not advice to buy a challenge.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Common questions" />
            <Faq items={FAQ} />
          </Card>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        faqLd(FAQ),
        {
          '@type': 'WebApplication',
          name: 'Prop firm challenge simulator',
          url: absoluteUrl('/props/challenge-simulator'),
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      ]} />
    </>
  );
}
