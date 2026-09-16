import type { NextConfig } from 'next';

/**
 * A content security policy for a site that publishes what strangers write.
 *
 * Its honest limit first: `script-src` carries 'unsafe-inline', because Next
 * inlines its own bootstrap and hydration scripts and the alternative — a nonce
 * per response — means rendering every page dynamically, which would cost the
 * static generation the whole site is built on. So this does not stop injected
 * inline script. What it does stop is worth having anyway: script from any
 * other origin, plugins, framing, form posts to somewhere else, and <base>
 * rewriting every relative URL on the page.
 *
 * The real defence against the reviews is upstream of this: React escapes what
 * it renders, no user text ever reaches dangerouslySetInnerHTML, and the two
 * places that use it take our own data and escape `<`.
 *
 * img-src is not 'self' because two kinds of picture come from elsewhere: coin
 * logos from CoinGecko, and article thumbnails from the four newsrooms whose
 * RSS the front page reads. It stays an explicit list rather than `https:` —
 * the hosts are known, and the list is what makes packages/ingest/src/news.ts
 * able to drop an image it cannot display instead of asking the browser for one
 * it will refuse. That file holds the same hosts and its test fails if this
 * line and that list ever disagree.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://assets.coingecko.com https://coin-images.coingecko.com" +
    ' https://cdn.sanity.io https://cdn.decrypt.co https://img.decrypt.co' +
    ' https://www.tbstat.com https://s3-images.ctmedia.io',
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  poweredByHeader: false,
  transpilePackages: ['@commentfx/core', '@commentfx/ingest', '@commentfx/db'],
  experimental: { optimizePackageImports: ['@commentfx/core', '@commentfx/ingest'] },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default config;
