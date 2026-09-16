import Link from 'next/link';
import type { Metadata } from 'next';
import { Header, Footer } from '@/components/chrome';
import { Card } from '@/components/primitives';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * Next's own 404 is black text on white with no header and no way back, and
 * this site reaches it on purpose: an unknown coin slug, a broker we do not
 * rank, a URL somebody mistyped. A reader who lands here still came looking for
 * something, so this says plainly what happened and offers the three doors that
 * answer most of it — search, the rankings, the coin list.
 *
 * `follow` but not `index`: the links out are worth following, the page itself
 * is not worth a place in an index.
 */
const DOORS = [
  { href: '/search', title: 'Search everything we publish', note: 'Brokers, prop firms, exchanges, coins and release dates, in one list' },
  { href: '/brokers', title: 'Broker rankings', note: 'Scored on licences, cost and withdrawal terms — the weights are published' },
  { href: '/coins', title: 'Coin prices', note: 'The top 100 by market cap, and where each one trades' },
  { href: '/calendar', title: 'Economic calendar', note: 'Release dates taken from the institution that sets them' },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="shell pt-0 pb-6 lg:pt-3 lg:pb-10 flex flex-col gap-0 lg:gap-4">
        <Card className="p-5" as="section">
          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em] leading-tight">
            We do not have that page
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.8] mt-3 max-w-[46ch]">
            Either the address is wrong, or it is a company or coin we do not cover.
            We only publish a page once there is licence and cost data to put on it,
            so the directory is smaller than the market.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold tracking-[-0.01em] mb-3">Try one of these</h2>
          <ul className="flex flex-col">
            {DOORS.map(({ href, title, note }) => (
              <li key={href} className="border-b border-line-2 last:border-b-0">
                <Link href={href} className="block py-[11px] group">
                  <span className="block text-[13.5px] font-semibold group-hover:text-brass">{title}</span>
                  <span className="block text-[11.5px] text-ink-3 leading-[1.6] mt-[2px]">{note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </main>
      <Footer />
    </>
  );
}
