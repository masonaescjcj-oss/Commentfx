import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { SITE } from '@/lib/site';

/**
 * Written from the schema rather than from a template.
 *
 * Every claim on this page is checkable against the code: what a review row
 * holds, how the fingerprint is derived and how long it lasts, which hosts a
 * reader's browser talks to. A privacy policy that describes a site in general
 * terms is the same failure this directory exists to point at in other people —
 * a document that sounds like an answer and is not one.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Privacy — what this site stores, and what it does not',
  description:
    'No analytics, no cookies for readers, and no IP address ever written down. What a review '
    + 'stores, how the one-way fingerprint works, who else sees your address, and how to remove '
    + 'anything you wrote.',
  path: '/privacy',
});

export const revalidate = 86400;

const trail = [{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy' }];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="What this site stores" trail={trail}>
          <p className="text-[14px] leading-[1.75] mt-2 max-w-[62ch]" style={{ color: 'var(--hero-ink-2)' }}>
            Short, because there is not much. Everything here describes what the code does, and the
            code is the part that decides.
          </p>
        </PageHero>

        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Reading it" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              Nothing is stored and nothing is set. There is no analytics service, no tag manager,
              no advertising pixel and no cookie — a request for a page here returns a page and
              asks your browser for nothing in return. You can confirm that from the outside:
              a response from any page on this site carries no <code className="text-[12.5px]">Set-Cookie</code> header
              at all, and the content security policy forbids the browser from connecting to any
              origin but this one.
            </p>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
              Two kinds of picture come from elsewhere, and your browser fetches those directly, so
              those hosts see your address the way any site you visit does: coin logos
              from CoinGecko, and article thumbnails from the four newsrooms whose headlines the
              front page reads. That is the whole list, and it is the same list the content security
              policy names.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Writing a review" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              A review stores what you typed, the rating and topic you chose, the day you wrote it,
              and two one-way values. It does not ask for your name or your email, because it does
              not want them.
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {[
                ['A fingerprint that expires daily',
                  'A SHA-256 of your network address, your browser’s user-agent string, a secret only '
                  + 'this deployment holds, and today’s date. Your address is not stored, and the '
                  + 'digest cannot be turned back into it. Because the date is part of it, the value '
                  + 'changes every midnight: today’s reviews cannot be matched against yesterday’s, '
                  + 'by us or by anybody who takes a copy of the database. It exists to count '
                  + 'distinct people and to stop one person writing fifty reviews, and it can do '
                  + 'nothing else.'],
                ['A hash of your withdrawal code',
                  'You are shown a one-time code when you publish. What is stored is a SHA-256 of it, '
                  + 'so the code works and we cannot read it. Lose it and nobody here can recover it '
                  + '— which is the cost of the review not being tied to an account.'],
              ].map(([title, body]) => (
                <li key={title} className="border-l-2 border-line pl-3">
                  <b className="text-[13px]">{title}</b>
                  <p className="text-[13px] text-ink-2 leading-[1.8] mt-1">{body}</p>
                </li>
              ))}
            </ul>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-4">
              If you offer evidence in the private box, an editor can read it and a reader cannot.
              It exists so a claim can be checked without publishing your account statement.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Reporting an outage" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              The same daily fingerprint, which broker it is about, which kind of problem, and an
              optional note that no reader sees until a moderator has cleared it. The fingerprint is
              the whole mechanism: the status a page shows changes only above a published number of
              distinct reporters inside a published window, and counting distinct people is
              impossible without some way to tell them apart. This is the least that does it.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Taking it back" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              A review comes down with the code you were given, at{' '}
              <Link href="/reviews/withdraw" className="text-accent">the withdrawal page</Link>. It
              stops being visible and stops counting towards any score immediately.
            </p>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
              The row is kept rather than deleted, marked withdrawn. That is a deliberate choice and
              worth saying plainly: a directory where a published claim can be made to have never
              existed is one where a score can be quietly rewritten afterwards. Nothing you wrote is
              shown to anybody again.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Editors" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              People who edit this site have accounts: a name, an email address, a password stored
              as a scrypt hash, and a session row that ends when they sign out. Every change they
              make is recorded against that account in a log nothing can delete from. None of that
              touches a reader, and there is no reader account to create.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Where it lives, and who to ask" />
            <p className="text-[13.5px] text-ink-2 leading-[1.8]">
              The site is served by Vercel and the data above is held in a hosted Postgres database.
              Both keep operational logs of requests, as any host does; neither is sent anything by
              this site beyond what serving a page requires.
            </p>
            <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3">
              {SITE.contact
                ? <>To ask what is held about you, or to have something removed, write to{' '}
                  <a href={`mailto:${SITE.contact}`} className="text-accent">{SITE.contact}</a>.</>
                : <>A contact address for privacy requests has not been published yet.</>}
            </p>
          </Card>

          <p className="gutter text-[12px] text-ink-3 leading-[1.75]">
            If this page and the code ever disagree, the code is what is happening and this page is
            the bug. It is worth telling us.
          </p>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
