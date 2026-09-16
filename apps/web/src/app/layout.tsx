import type { Metadata, Viewport } from 'next';
import { Manrope, Bricolage_Grotesque } from 'next/font/google';
import { SITE } from '@/lib/site';
import { JsonLd, organizationLd, websiteLd } from '@/lib/seo';
import './globals.css';

/**
 * Self-hosted by Next at build time, so no request leaves for a font CDN.
 *
 * `optional`, not `swap`, and that is the whole of what keeps this site's
 * layout still. The line above used to end "no layout shift" and it was not
 * true: measured on Chrome's Slow 4G with a 4x CPU throttle, six page shapes
 * were over Google's 0.1 — the memecoin radar at 0.174. Next builds a
 * metric-adjusted fallback that matches x-height and line box, which it cannot
 * do for advance widths, so text wrapped differently until Manrope arrived and
 * then every card on the page jumped: the h1 lost a line, each broker's stat
 * row went from two rows to one, the footer lost 33px. A second into the visit,
 * exactly as somebody starts reading.
 *
 * With `optional` a slow first visit keeps the fallback for the whole page and
 * is never swapped under the reader, and every visit after has the font from
 * the first paint. The cost is real and it is the right way round: one visit
 * rendered in a plain sans instead of every visit rearranging itself.
 *
 * check:vitals holds it there.
 */
const manrope = Manrope({
  subsets: ['latin'], display: 'optional', variable: '--font-manrope', weight: ['400', '500', '600', '700', '800'],
});
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'], display: 'optional', variable: '--font-bricolage', weight: ['600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: SITE.name, locale: SITE.locale, url: SITE.url },
  twitter: { card: 'summary_large_image', site: SITE.twitter },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${manrope.variable} ${bricolage.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <JsonLd graph={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}
