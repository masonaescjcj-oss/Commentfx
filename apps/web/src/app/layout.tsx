import type { Metadata, Viewport } from 'next';
import { Manrope, Bricolage_Grotesque } from 'next/font/google';
import { SITE } from '@/lib/site';
import { JsonLd, organizationLd, websiteLd } from '@/lib/seo';
import './globals.css';

// Self-hosted by Next at build time: no third-party request, no layout shift.
const manrope = Manrope({
  subsets: ['latin'], display: 'swap', variable: '--font-manrope', weight: ['400', '500', '600', '700', '800'],
});
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'], display: 'swap', variable: '--font-bricolage', weight: ['600', '700'],
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
  themeColor: '#F1F2F4',
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
