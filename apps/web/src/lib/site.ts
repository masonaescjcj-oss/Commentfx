export const SITE = {
  name: 'CommentFX',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://commentfx.com',
  tagline: 'Broker, prop firm and exchange rankings',
  description:
    'Independent rankings for forex brokers, prop firms and crypto exchanges. ' +
    'Published scoring weights, licence data checked against regulators, and a rank that is not for sale.',
  locale: 'en_US',
  twitter: '@commentfx',
  /** Categories in the header, in order. Also the top-level internal link graph. */
  nav: [
    { href: '/brokers', label: 'Brokers' },
    { href: '/props', label: 'Prop Firms' },
    { href: '/exchanges', label: 'Exchanges' },
    { href: '/memecoins', label: 'Memecoins' },
    { href: '/coins', label: 'Coins' },
    { href: '/news', label: 'News' },
  ],
} as const;

export const absoluteUrl = (path = '/') =>
  new URL(path, SITE.url).toString();
