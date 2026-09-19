import type { Metadata, Viewport } from 'next';
import { Manrope, Bricolage_Grotesque } from 'next/font/google';
import { SITE } from '@/lib/site';
import { JsonLd, organizationLd, websiteLd } from '@/lib/seo';
import { HeaderAutoHide } from '@/components/HeaderAutoHide';
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
  alternates: {
    canonical: '/',
    // How a feed reader finds the feed: from the head of every page, which is
    // where every one of them looks and the only place they look.
    types: { 'application/rss+xml': [{ url: '/learn/feed.xml', title: `${SITE.name} — Guides` }] },
  },
  /**
   * The icons, declared rather than left to the file convention.
   *
   * The site shipped with only `app/icon.svg`, so the head advertised an SVG
   * and nothing else, and /favicon.ico — the address every crawler tries when
   * it wants a site's mark — returned 404. Google's result for the homepage
   * showed the grey globe it uses when it could not find one.
   *
   * The convention alone could not fix it: adding an `icon.png` beside the
   * `icon.svg` makes Next emit one of them and silently drop the other, and it
   * labels favicon.ico `sizes="16x16"` from the first frame in the file, which
   * understates a file that carries 16 through 96 and is below the 48px
   * multiple Google asks for. Written out, each one says what it is.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '16x16 32x32 48x48 64x64 96x96' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
  },
  openGraph: { type: 'website', siteName: SITE.name, locale: SITE.locale, url: SITE.url },
  twitter: { card: 'summary_large_image', site: SITE.twitter },
  /**
   * Search Console and Bing Webmaster Tools prove ownership by looking for a
   * meta tag on the homepage. Both are read from the environment rather than
   * committed, because the token is per-property: it changes if the property is
   * re-created, and a stale one hard-coded here would fail verification with
   * nothing on the page to explain why.
   *
   * Set GOOGLE_SITE_VERIFICATION to the content value Search Console gives you
   * for the "HTML tag" method, redeploy, then press Verify. Unset, nothing is
   * rendered — an empty verification tag is worse than none, because it looks
   * like it should work.
   */
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1630',
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
        {/* Renders nothing; it only sets an attribute on <html> that the
            stylesheet reads. In the layout rather than in Header so the one
            listener is registered once for the whole app rather than on each
            navigation. */}
        <HeaderAutoHide />
        <JsonLd graph={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}
