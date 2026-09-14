import { REGULATORS } from '@commentfx/core';
import { getBroker, getProp, getExchange } from './repo';
import type { Kind } from '@commentfx/db';

export interface Source {
  label: string;
  url: string;
}

const site = (kind: Kind, slug: string): string | undefined =>
  (kind === 'broker' ? getBroker(slug) : kind === 'prop' ? getProp(slug) : getExchange(slug))?.website;

/**
 * Where to go to check a field.
 *
 * The slowest part of verifying a record is not reading the number, it is
 * finding the page that carries it. Licence numbers belong to the regulator's
 * register and nowhere else; everything else is the company's own published
 * terms. Neither is scraped — these are links for a person to open, and the
 * verification is only real because a person opened one.
 */
export function whereToCheck(kind: Kind, slug: string, field: string): Source[] {
  if (field === 'entities.licences') {
    const broker = getBroker(slug);
    if (!broker) return [];
    const seen = new Set<string>();
    return broker.entities.flatMap((e) => {
      const reg = REGULATORS[e.licence.regulator];
      if (!reg?.registryUrl || seen.has(reg.code)) return [];
      seen.add(reg.code);
      return [{ label: `${reg.code} register`, url: reg.registryUrl }];
    });
  }

  const url = site(kind, slug);
  return url ? [{ label: 'Company site', url }] : [];
}
