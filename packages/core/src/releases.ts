/**
 * The releases that get a page of their own.
 *
 * This is a fixed list rather than whatever the schedule happened to contain
 * when the site was built: a URL that appears and disappears with an upstream
 * fetch is a URL nobody can link to. The dates on each page come from the live
 * schedule; the page itself exists either way, and says so when the schedule
 * could not be read.
 *
 * Every description below states what the release measures and who publishes
 * it. None of them claims a pattern ("the first Friday of the month") — the
 * dates are read from the publisher, so there is nothing to gain from asserting
 * a rule the publisher does not.
 */

export interface Release {
  slug: string;
  /** Matched exactly against the title the source publishes. */
  title: string;
  /** What a person would search for. */
  name: string;
  publisher: string;
  publisherUrl: string;
  currency: 'USD' | 'EUR';
  /** A statistical release is published; a rate decision is taken at a meeting. */
  kind: 'release' | 'decision';
  /** Two or three factual sentences. No forecasts, no trading advice. */
  what: string;
  /** Why it is worth a trader's attention, in one sentence. */
  why: string;
}

export const RELEASES: Release[] = [
  {
    slug: 'us-jobs-report',
    title: 'Employment Situation',
    name: 'US jobs report (Non-Farm Payrolls)',
    publisher: 'Bureau of Labor Statistics',
    publisherUrl: 'https://www.bls.gov/news.release/empsit.toc.htm',
    currency: 'USD',
    kind: 'release',
    what:
      'The Employment Situation report carries non-farm payroll employment, the ' +
      'unemployment rate and average hourly earnings, from two separate surveys — ' +
      'one of employers, one of households. It is published by the US Bureau of ' +
      'Labor Statistics.',
    why:
      'It is the single largest scheduled source of volatility in dollar pairs, and ' +
      'the payroll figure is revised in the two reports that follow it.',
  },
  {
    slug: 'us-inflation-cpi',
    title: 'Consumer Price Index',
    name: 'US inflation (CPI)',
    publisher: 'Bureau of Labor Statistics',
    publisherUrl: 'https://www.bls.gov/cpi/',
    currency: 'USD',
    kind: 'release',
    what:
      'The Consumer Price Index measures the change in prices paid by urban ' +
      'consumers for a fixed basket of goods and services. The core measure, which ' +
      'markets watch more closely, excludes food and energy.',
    why:
      'It is the release that most directly shapes expectations for the next Fed ' +
      'decision, which is why it moves rates and the dollar together.',
  },
  {
    slug: 'us-producer-prices-ppi',
    title: 'Producer Price Index',
    name: 'US producer prices (PPI)',
    publisher: 'Bureau of Labor Statistics',
    publisherUrl: 'https://www.bls.gov/ppi/',
    currency: 'USD',
    kind: 'release',
    what:
      'The Producer Price Index measures the change in prices received by domestic ' +
      'producers for their output — the cost side of inflation, before it reaches a ' +
      'consumer.',
    why:
      'It arrives close to the CPI and is read as a check on it, so a large divergence ' +
      'between the two gets attention.',
  },
  {
    slug: 'us-job-openings-jolts',
    title: 'Job Openings and Labor Turnover Survey',
    name: 'US job openings (JOLTS)',
    publisher: 'Bureau of Labor Statistics',
    publisherUrl: 'https://www.bls.gov/jlt/',
    currency: 'USD',
    kind: 'release',
    what:
      'JOLTS reports job openings, hires, quits and layoffs. The quits rate is read ' +
      'as a measure of how confident workers are about finding another job.',
    why:
      'It is the clearest monthly read on labour demand between jobs reports, and it ' +
      'covers a month already past — the lag is part of how it should be read.',
  },
  {
    slug: 'us-employment-cost-index',
    title: 'Employment Cost Index',
    name: 'US employment cost index',
    publisher: 'Bureau of Labor Statistics',
    publisherUrl: 'https://www.bls.gov/eci/',
    currency: 'USD',
    kind: 'release',
    what:
      'The Employment Cost Index measures the change in wages, salaries and benefits ' +
      'per hour worked, quarterly, controlling for shifts between industries and ' +
      'occupations.',
    why:
      'Because it controls for job mix, it is the wage measure central bankers cite ' +
      'most often when they talk about inflation persistence.',
  },
  {
    slug: 'fed-rate-decision',
    title: 'FOMC rate decision',
    name: 'Fed interest rate decision (FOMC)',
    publisher: 'Federal Reserve',
    publisherUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    currency: 'USD',
    kind: 'decision',
    what:
      'The Federal Open Market Committee sets the target range for the federal funds ' +
      'rate. It holds eight scheduled meetings a year, each over two days, and the ' +
      'decision comes on the second. Four of them are published alongside the ' +
      'Summary of Economic Projections.',
    why:
      'It sets the price of dollars. The statement wording and the projections ' +
      'usually matter more to the market than the rate itself.',
  },
  {
    slug: 'ecb-rate-decision',
    title: 'ECB rate decision',
    name: 'ECB interest rate decision',
    publisher: 'European Central Bank',
    publisherUrl: 'https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html',
    currency: 'EUR',
    kind: 'decision',
    what:
      'The ECB Governing Council sets the three key interest rates for the euro area. ' +
      'Monetary policy meetings run over two days, with the decision and a press ' +
      'conference on the second.',
    why:
      'It is the euro’s equivalent of the FOMC, and the press conference routinely ' +
      'moves the currency more than the decision.',
  },
];

/** What to call the dates on a page: a release is published, a decision is taken. */
export const scheduleNoun = (r: Release) => (r.kind === 'decision' ? 'meeting dates' : 'release dates');

export const releaseBySlug = (slug: string) => RELEASES.find((r) => r.slug === slug);

/** The release page a calendar event belongs to, if it has one. */
export const releaseForTitle = (title: string) => RELEASES.find((r) => r.title === title);
