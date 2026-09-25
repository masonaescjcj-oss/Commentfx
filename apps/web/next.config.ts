import { join } from 'node:path';
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

  /**
   * News thumbnails go through Next's optimiser rather than straight to the
   * publisher's CDN.
   *
   * They are drawn at 64px and the publishers send what they have: the front
   * page was pulling 2.7MB of images, 2.1MB of which was two article covers at
   * 1181kB and 959kB for two 64px squares. On the throttled profile check:vitals
   * uses that is fourteen seconds for two pictures, and it was found by that
   * check timing out rather than by anyone looking.
   *
   * Resizing at our end rather than guessing each CDN's query parameters: two
   * of the four publish a documented way to ask for a smaller file and two do
   * not, and a guessed parameter that 404s costs the picture. This way one
   * mechanism covers all four, our server fetches the original once and caches
   * it, and their bandwidth bill goes down too.
   *
   * The hosts are the same list as the CSP's, and news.test.ts fails if this
   * and that list ever disagree.
   */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cdn.decrypt.co' },
      { protocol: 'https', hostname: 'img.decrypt.co' },
      { protocol: 'https', hostname: 'www.tbstat.com' },
      { protocol: 'https', hostname: 's3-images.ctmedia.io' },
    ],
    // The one size they are ever drawn at, and its 2x. Asking for a ladder of
    // eight widths would have the optimiser build seven nobody requests.
    imageSizes: [64, 128],
    formats: ['image/webp'],
  },

  serverExternalPackages: ['@electric-sql/pglite', 'pg'],

  /**
   * The migrations have to travel with the server, and nothing works that out.
   *
   * `applyMigrations` reads `packages/db/migrations` off disk at runtime, with
   * readdirSync on a path it builds itself. Next traces what a bundle needs by
   * following imports, and a directory read through a computed path is not an
   * import — so the .sql files were in no trace at all. On a host that ships
   * only the traced files, that is a deployment which installs cleanly, builds
   * cleanly, serves every read-only page, and throws ENOENT the first time
   * anybody writes. The same shape of failure the migration code's own comment
   * describes, one layer further out.
   *
   * The root is pinned as well, because in a workspace Next guesses it from the
   * nearest lockfile and a guess that lands on apps/web makes these paths point
   * at nothing.
   */
  outputFileTracingRoot: join(import.meta.dirname, '..', '..'),
  outputFileTracingIncludes: {
    '/**': ['../../packages/db/migrations/*.sql'],
  },
  poweredByHeader: false,
  transpilePackages: ['@commentfx/core', '@commentfx/ingest', '@commentfx/db'],
  experimental: { optimizePackageImports: ['@commentfx/core', '@commentfx/ingest'] },

  /**
   * One host. www.commentfx.com was attached to the project and served every
   * page with a 200, so each page existed twice and a search engine had to be
   * told by the canonical tag, page by page, which copy was the real one —
   * and Search Console reported the leftovers. A permanent redirect says it
   * once, for every path, before any page renders: the path and the query
   * string carry over, and the canonical, the sitemap and every internal link
   * already name the bare domain, so nothing on the site points at www.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.commentfx.com' }],
        destination: 'https://commentfx.com/:path*',
        permanent: true,
      },
    ];
  },

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
