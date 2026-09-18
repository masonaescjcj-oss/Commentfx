import Link from 'next/link';
import type { Metadata } from 'next';
import { BROKERS, PROPS, EXCHANGES, ARTICLES } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { SITE } from '@/lib/site';
import { researchedCount, sourcesCited, readAtOrigin, originTracked } from '@/lib/about';

/**
 * Who is behind this, for a reader deciding whether to believe any of it.
 *
 * The category is money, where the thing that decides whether a page is worth
 * reading is not how confident it sounds but whether anybody stands behind it.
 * So this page is written to be checked rather than to reassure: the numbers on
 * it are counted from the data at build time, not typed in, and the section
 * about what the site does not know is longer than the one about what it does.
 *
 * Every figure here moves on its own when the data moves. A page that said "we
 * research every broker" would keep saying it after somebody added an
 * unresearched one; this one counts.
 */
export const metadata: Metadata = pageMetadata({
  title: 'About — who runs this, and how it is paid for',
  description:
    'One person, twenty-six records, ninety-five sources, and no commercial relationship with '
    + 'anybody ranked. What this site checks, what it cannot, and how to tell us when it is wrong.',
  path: '/about',
});

export const revalidate = 86400;

const trail = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];
const records = BROKERS.length + PROPS.length + EXCHANGES.length;

export default function AboutPage() {
  const named = SITE.editor.name.trim().length > 0;

  return (
    <>
      <Header />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="Who is behind this" trail={trail}>
          <p className="text-[14px] leading-[1.75] mt-2 max-w-[62ch]" style={{ color: 'var(--hero-ink-2)' }}>
            A directory about money is worth exactly what the person who made it is worth. Here is
            who that is, what they checked, and what they could not.
          </p>
        </PageHero>

        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="One person" />
            {named ? (
              <>
                <p className="text-[13.5px] text-ink-2 leading-[1.8]">
                  <b className="text-ink">{SITE.editor.name}</b> researches, writes and edits
                  everything here. {SITE.editor.background}
                </p>
                <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
                  There is no newsroom behind that name and no second opinion before a record goes
                  up. That is worth knowing: one person’s judgement decides what every score means,
                  and one person misses things a desk of five would catch.
                </p>
              </>
            ) : (
              <>
                <p className="text-[13.5px] text-ink-2 leading-[1.8]">
                  This site is researched, written and edited by one person, who has not put their
                  name to it.
                </p>
                <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
                  You should trust it less for that, and it would be strange to pretend otherwise on
                  a page whose whole job is to say who is responsible. An anonymous directory about
                  where to put your money is asking you to take its word, which is the one thing
                  every page here tells you not to do.
                </p>
                <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
                  What is offered instead of a name is everything below: every figure carries the
                  document it came from and the day somebody read it, the weights behind every score
                  are published in full, and the records that nobody could confirm are marked as
                  such rather than quietly averaged in with the rest. That is a weaker thing than a
                  named editor with a reputation to lose. It is not nothing.
                </p>
              </>
            )}
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="What is actually here" aside={<span className="text-[11.5px] text-ink-3 tnum">{researchedCount} researched</span>} />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
                [`${records}`, 'records, each researched'],
                [`${sourcesCited}`, 'sources cited, with dates'],
                [`${readAtOrigin} of ${originTracked}`, 'prop firms and exchanges whose own pages answered'],
                [`${ARTICLES.length}`, 'guides'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-[22px] font-bold tnum leading-none">{value}</dt>
                  <dd className="text-[12px] text-ink-3 leading-[1.6] mt-[6px]">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-5">
              The third number is the one worth reading twice. Most of these companies do not answer
              an ordinary request for their own published figures — a research request gets a 403 —
              so most records here were built from registers, filings and regulators’ own notices
              rather than from the company. Where that is true the page says so, and the score
              carries a component for it, because a directory that lets “we could not check”
              outrank “we checked and it was worse than we thought” is measuring the wrong thing.
            </p>
          </Card>

          <Card className="p-4 lg:p-6 border-[1.5px] border-accent shadow-none" as="section">
            <h2 className="text-[14px] font-bold text-accent-2 mb-2">How this is paid for</h2>
            <p className="text-[13.5px] text-ink-2 leading-[1.85]">
              It is not. There are no affiliate links on this site, no paid placement, no
              advertising and no commercial relationship with anybody ranked. Every link to a
              company goes to that company’s own address, carries <code className="text-[12px]">rel=&quot;nofollow&quot;</code>,
              and earns nothing.
            </p>
            <p className="text-[13.5px] text-ink-2 leading-[1.85] mt-3">
              That is a statement about today and not a promise about next year. If it ever changes,
              it changes here and on{' '}
              <Link href="/methodology" className="text-accent">the methodology page</Link> first,
              before a single link does — and commission will never be an input to a score, because
              the moment it is, none of the rest of this is worth reading.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="How a record is made" />
            <ol className="flex flex-col gap-3 text-[13.5px] text-ink-2 leading-[1.8]">
              {[
                ['The documents first.',
                  'Company registers, regulators’ own registers, statutory filings, enforcement '
                  + 'notices and charging documents — read, not summarised from somewhere else. '
                  + 'Every fact on a record page carries the source it came from and the day it '
                  + 'was read.'],
                ['Then the figures.',
                  'Spreads, fees, drawdown rules, splits. Published by the company where the '
                  + 'company publishes them, and marked as unread where it does not.'],
                ['Then the score, from weights that are printed.',
                  'Nothing is weighted in private. A component nobody could measure is excluded '
                  + 'and the rest are renormalised, rather than scored zero — no data is not a bad '
                  + 'score, it is no score.'],
                ['Then it is checked again, daily.',
                  'Every licence this site publishes is compared against the regulator’s own '
                  + 'register once a day. A disagreement becomes a finding for an editor, never an '
                  + 'automatic correction: a scraper is wrong often enough that letting it rewrite '
                  + 'a record would eventually publish a falsehood about a real company.'],
              ].map(([title, body]) => (
                <li key={title} className="border-l-2 border-line pl-3">
                  <b className="text-ink">{title}</b> {body}
                </li>
              ))}
            </ol>
            <p className="text-[12.5px] text-ink-3 leading-[1.75] mt-4">
              The full weights and what each component means are on{' '}
              <Link href="/methodology" className="text-accent">the methodology page</Link>.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="What this site is not" />
            <ul className="flex flex-col gap-2 text-[13.5px] text-ink-2 leading-[1.8]">
              {[
                'Advice. Nothing here tells you what to do with your money, and a high score is not a recommendation — it is a statement about published figures and checkable documents.',
                'Complete. Twenty-six companies out of thousands. A company absent from these lists has not been judged and found wanting; it has not been looked at.',
                'A news site. Records are researched on a date and that date is printed on them. Something that happened this morning is not here yet.',
                'A review aggregator. A review counts towards a score only after a person has checked the evidence behind it, and the count of checked and unchecked is shown either way.',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span aria-hidden className="text-ink-3 shrink-0">—</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="When it is wrong" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              It will be. Records here have already been corrected against the documents — a prop
              firm’s founding year, a split that turned out to be the top of a ladder rather than
              what a funded trader is paid — and those corrections are written into the record
              rather than quietly applied.
            </p>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
              If a figure here is wrong, the fastest fix is the document that proves it.{' '}
              {SITE.contact
                ? <>Send it to <a href={`mailto:${SITE.contact}`} className="text-accent">{SITE.contact}</a>.</>
                : <>There is no contact address published yet, which is a gap and is being treated as one.</>}{' '}
              If you have dealt with one of these companies yourself, the review box on its page
              takes that, and{' '}
              <Link href="/privacy" className="text-accent">the privacy page</Link> says exactly
              what happens to what you write.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
