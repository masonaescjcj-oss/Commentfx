import type { Sponsor } from '@/lib/sponsors';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead, Tag } from '@/components/primitives';
import { SponsorHero } from '@/components/RecordHero';
import { FactList } from '@/components/ranking';
import { JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { Faq } from '@/components/Faq';

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
        <PageHero trail={trail}>
          <SponsorHero
            logo={s.logo}
            name={s.name}
            pitch={s.pitch}
            visit={{ href: s.url, label: `Visit ${s.name}` }}
            facts={[
              { label: 'Cheapest challenge', value: `${s.from.account} for ${s.from.price}` },
              { label: 'Fee per $100k', value: '$329' },
              { label: 'Profit split', value: 'Up to 90%' },
              { label: 'Payouts', value: 'Every 14 days' },
            ]}
            terms={[
              { label: 'Stages', value: '1' },
              { label: 'Profit target', value: '8%' },
              { label: 'Daily loss limit', value: '3%' },
              { label: 'Total loss limit', value: '10%' },
            ]}
          >
            <div className="flex gap-[5px] flex-wrap mt-4">
              <Tag tone="accent">One stage</Tag>
              <Tag tone="accent">News trading</Tag>
              <Tag tone="accent">Weekends open</Tag>
              <Tag tone="accent">Fee refunded</Tag>
            </div>
          </SponsorHero>
        </PageHero>
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title={`About ${s.name}`} />
            <p className="text-[14px] leading-[1.8] text-ink-2 max-w-[68ch]">{s.about}</p>
            <p className="text-[12px] leading-[1.75] text-ink-3 mt-3">
              From {s.name}’s published terms, {asDate(s.checked)}.
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
            <CardHead title="Common questions" />
            <Faq items={s.faq} />
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
      <JsonLd graph={[breadcrumbLd(trail), faqLd(s.faq)]} />
    </>
  );
}
