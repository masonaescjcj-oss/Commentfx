import Link from 'next/link';
import type { Sponsor } from '@/lib/sponsors';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead, Logo } from '@/components/primitives';
import { FactList } from '@/components/ranking';
import { JsonLd, breadcrumbLd } from '@/lib/seo';

const asDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Every link to the sponsor is a paid link and says so. */
function Out({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} rel="sponsored noopener noreferrer" target="_blank" className={className}>
      {children}
    </a>
  );
}

/**
 * A sponsor's page: its own published terms, laid out the way this site lays
 * out terms, and nothing this site would call a judgement.
 *
 * What a ranked firm's page has and this one does not is the point of it: no
 * score, no rank, no breakdown, no verdict, no pros and cons, no reader
 * reviews, no Review or Rating markup. Those are the things a reader takes as
 * this site's opinion, and a sponsor is not given one. What it is given is
 * space for facts — every row read from its own pages on the day printed, and
 * the pages linked so anyone can check them.
 */
export function SponsorListing({ sponsor: s }: { sponsor: Sponsor }) {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Prop Firms', path: '/props' },
    { name: s.name, path: `/props/${s.slug}` },
  ];
  const L = s.listing;

  return (
    <>
      <Header active="/props" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title={`${s.name} — sponsored listing`} trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

          <Card className="p-4 lg:p-6" as="section">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-3 mb-3">Sponsored</p>
            <div className="flex items-start gap-3">
              <Logo {...s.logo} size={48} />
              <div className="flex-1 min-w-0">
                <h2 className="font-[family-name:var(--font-display)] text-[18px] lg:text-[20px] font-bold tracking-[-0.02em]">
                  {s.name}
                </h2>
                <p className="text-[14px] leading-[1.75] text-ink-2 mt-1 max-w-[62ch]">{s.pitch}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                  <Out
                    href={s.url}
                    className="inline-flex items-center gap-1 rounded-[10px] bg-accent text-white text-[13.5px] font-semibold px-4 py-[9px] hover:bg-accent-2"
                  >
                    Visit {s.name} <span aria-hidden>›</span>
                  </Out>
                  <span className="text-[13px] text-ink-2">
                    {s.from.account} challenge from <b className="tnum">{s.from.price}</b>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[12px] leading-[1.75] text-ink-3 mt-5 pt-4 border-t border-line-2 max-w-[68ch]">
              This is a sponsored listing, not a CommentFX evaluation. Everything below is taken from{' '}
              {s.name}’s own published terms, read on {asDate(s.checked)}. It has no score and no rank; the
              firms in <Link href="/props" className="text-accent">the prop firm rankings</Link> are scored on{' '}
              <Link href="/methodology" className="text-accent">published weights</Link>, and a sponsor cannot
              buy a place among them.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Challenge plans" />
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-ink-3">
                    <th scope="col" className="font-semibold py-2 pr-3">Account</th>
                    <th scope="col" className="font-semibold py-2 pr-3">Fee</th>
                    <th scope="col" className="font-semibold py-2 pr-3">Leverage</th>
                    <th scope="col" className="font-semibold py-2">Split</th>
                  </tr>
                </thead>
                <tbody>
                  {L.plans.map((p) => (
                    <tr key={p.account} className="border-t border-line-2">
                      <th scope="row" className="text-left font-semibold py-[9px] pr-3 tnum">{p.account}</th>
                      <td className="py-[9px] pr-3 tnum">
                        <b>{p.fee}</b>{' '}
                        <s className="text-ink-3 text-[12px]"><span className="sr-only">list price </span>{p.listFee}</s>
                      </td>
                      <td className="py-[9px] pr-3 tnum">{p.leverage}</td>
                      <td className="py-[9px] tnum">{p.split}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] leading-[1.75] text-ink-3 mt-3 max-w-[68ch]">{L.plansNote}</p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Rules" />
            <FactList rows={L.rules} />
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Payouts" />
            <FactList rows={L.payouts} />
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Trading" />
            <FactList rows={L.trading} />
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Where these figures come from" />
            <ul className="flex flex-col">
              {s.sources.map((src) => (
                <li key={src.url} className="border-b border-line-2 last:border-b-0 py-[10px] text-[13px]">
                  <Out href={src.url} className="text-accent hover:text-accent-2">{src.label}</Out>
                  <span className="text-ink-3"> — read {asDate(s.checked)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
