import { eq, and } from 'drizzle-orm';
import type { AppDb } from './client.ts';
import { verifications, type entityKind } from './schema.ts';

export type Kind = (typeof entityKind.enumValues)[number];

/** A verification older than this is treated as expired, not merely old. */
export const STALE_AFTER_DAYS = 90;

/** The fields the site will not publish as fact until someone has checked them. */
export const REQUIRED_FIELDS: Record<Kind, string[]> = {
  broker: [
    'cost.eurusdSpread', 'cost.commissionPerLot',
    'payments.minDepositUsd', 'payments.statedWithdrawalHours',
    'platforms.maxLeverage', 'entities.licences',
  ],
  prop: [
    'rules.drawdownType', 'rules.maxDrawdownPct', 'rules.consistencyRule',
    'payout.splitPct', 'feeUsdPer100k',
  ],
  exchange: [
    'takerFeePct', 'reserves.proofOfReserves', 'security.lastBreachYear',
  ],
};

export interface FieldState {
  field: string;
  verifiedAt: Date | null;
  ageDays: number | null;
  sourceUrl: string | null;
  verifiedBy: string | null;
  state: 'verified' | 'stale' | 'unverified';
}

export interface Coverage {
  kind: Kind;
  slug: string;
  fields: FieldState[];
  verified: number;
  stale: number;
  unverified: number;
  /** 0–1. What share of required fields is currently verified and fresh. */
  ratio: number;
}

const dayMs = 86_400_000;

export function classify(verifiedAt: Date | null, now = new Date()): FieldState['state'] {
  if (!verifiedAt) return 'unverified';
  return (now.getTime() - verifiedAt.getTime()) / dayMs > STALE_AFTER_DAYS ? 'stale' : 'verified';
}

/**
 * What a reader is entitled to know: which facts on this page someone actually
 * checked, against what, and how long ago.
 */
export async function coverageFor(
  db: AppDb,
  kind: Kind,
  slug: string,
  now = new Date(),
): Promise<Coverage> {
  const rows = await db
    .select()
    .from(verifications)
    .where(and(eq(verifications.kind, kind), eq(verifications.slug, slug)));

  const byField = new Map(rows.map((r) => [r.field, r]));

  const fields: FieldState[] = REQUIRED_FIELDS[kind].map((field) => {
    const row = byField.get(field);
    const verifiedAt = row?.verifiedAt ?? null;
    return {
      field,
      verifiedAt,
      ageDays: verifiedAt ? Math.floor((now.getTime() - verifiedAt.getTime()) / dayMs) : null,
      sourceUrl: row?.sourceUrl ?? null,
      verifiedBy: row?.verifiedBy ?? null,
      state: classify(verifiedAt, now),
    };
  });

  const count = (s: FieldState['state']) => fields.filter((f) => f.state === s).length;
  const verified = count('verified');
  return {
    kind, slug, fields,
    verified, stale: count('stale'), unverified: count('unverified'),
    ratio: fields.length === 0 ? 1 : verified / fields.length,
  };
}

/** The admin queue: everything needing a first check or a re-check, worst first. */
export async function verificationQueue(db: AppDb, kind: Kind, slugs: string[], now = new Date()) {
  const all = await Promise.all(slugs.map((slug) => coverageFor(db, kind, slug, now)));
  return all
    .filter((c) => c.ratio < 1)
    .sort((a, b) => a.ratio - b.ratio || b.unverified - a.unverified);
}
