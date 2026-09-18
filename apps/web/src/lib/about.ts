import { PROFILES, PROP_PROFILES, EXCHANGE_PROFILES } from '@commentfx/core';

/**
 * The about page's numbers, counted rather than typed.
 *
 * A page that claims "every record is researched" keeps claiming it after
 * somebody adds one that is not. These move on their own, which is the only way
 * a claim about the data stays true after the data changes — and the about page
 * is the last page on the site that should be out of date about the site.
 */
const brokers = Object.values(PROFILES);
/**
 * Only these two record whether the company's own pages answered. The broker
 * profiles predate that field, so they are counted separately rather than
 * folded in — "4 of 26" would have read as though twenty-two brokers had been
 * checked and refused, when ten of them were never asked in those terms.
 */
const tracked = [...Object.values(PROP_PROFILES), ...Object.values(EXCHANGE_PROFILES)];
const all = [...brokers, ...tracked];

export const researchedCount = all.length;
export const sourcesCited = all.reduce((n, p) => n + p.sources.length, 0);

/** Of the records that record it, how many anybody could read at the source. */
export const originTracked = tracked.length;
export const readAtOrigin = tracked.filter((p) => p.originReadable).length;
