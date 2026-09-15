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
    { href: '/calendar', label: 'Calendar' },
  ],
} as const;

export const absoluteUrl = (path = '/') => {
  const url = new URL(path, SITE.url).toString();
  /**
   * Next renders canonicals with `trailingSlash` false, so it strips the slash
   * the URL constructor adds to the root. Stripping it here too is what keeps
   * the sitemap and the canonical saying the same thing about the one URL every
   * crawler starts at. They disagreed until check:sitemap asked.
   */
  return url.endsWith('/') ? url.slice(0, -1) : url;
};
