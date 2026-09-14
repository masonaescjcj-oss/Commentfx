import { BROKERS, PROPS, EXCHANGES, REGULATORS } from '@commentfx/core';
import { getDb, schema, type AppDb } from './client.ts';

/**
 * Loads the curated records into the database. Idempotent: re-running updates
 * rather than duplicating, so it is safe against a live database.
 *
 * It deliberately does NOT write any verification rows. Seeding is not
 * checking, and nothing may appear verified because a script ran.
 */
export async function seed(db: AppDb) {
  const counts = { regulators: 0, brokers: 0, entities: 0, props: 0, exchanges: 0 };

  for (const r of Object.values(REGULATORS)) {
    await db.insert(schema.regulators).values({
      code: r.code, name: r.name, country: r.country, tier: r.tier,
      compensation: r.compensation, registryUrl: r.registryUrl,
    }).onConflictDoUpdate({ target: schema.regulators.code, set: { name: r.name, tier: r.tier } });
    counts.regulators++;
  }

  for (const b of BROKERS) {
    const row = {
      slug: b.slug, name: b.name, founded: b.founded, headquarters: b.headquarters, why: b.why,
      eurusdSpread: b.cost.eurusdSpread, commissionPerLot: b.cost.commissionPerLot,
      swapFreeAvailable: b.cost.swapFreeAvailable,
      paymentMethods: b.payments.methods, statedWithdrawalHours: b.payments.statedWithdrawalHours,
      minDepositUsd: b.payments.minDepositUsd,
      platforms: b.platforms.list, execution: b.platforms.execution,
      copyTrading: b.platforms.copyTrading, maxLeverage: b.platforms.maxLeverage,
      publishesEntityMapping: b.transparency.publishesEntityMapping,
      publishesAuditedAccounts: b.transparency.publishesAuditedAccounts,
      segregatedClientFunds: b.transparency.segregatedClientFunds,
      publicOwnership: b.transparency.publicOwnership,
      logo: b.logo, updatedAt: new Date(),
    };
    await db.insert(schema.brokers).values(row)
      .onConflictDoUpdate({ target: schema.brokers.slug, set: row });
    counts.brokers++;

    await db.delete(schema.brokerEntities).where(eqSlug(b.slug));
    for (const [i, e] of b.entities.entries()) {
      await db.insert(schema.brokerEntities).values({
        brokerSlug: b.slug, legalName: e.legalName, country: e.country,
        regulatorCode: e.licence.regulator, licenceNumber: e.licence.number,
        status: e.licence.status, serves: e.serves, position: i,
      });
      counts.entities++;
    }
  }

  for (const p of PROPS) {
    const row = {
      slug: p.slug, name: p.name, founded: p.founded, headquarters: p.headquarters,
      markets: p.markets, why: p.why,
      steps: String(p.rules.steps), profitTargetPct: p.rules.profitTargetPct,
      dailyDrawdownPct: p.rules.dailyDrawdownPct, maxDrawdownPct: p.rules.maxDrawdownPct,
      drawdownType: p.rules.drawdownType, consistencyRule: p.rules.consistencyRule,
      timeLimitDays: p.rules.timeLimitDays, newsTrading: p.rules.newsTrading,
      weekendHolding: p.rules.weekendHolding, minTradingDays: p.rules.minTradingDays,
      splitPct: p.payout.splitPct, payoutFrequencyDays: p.payout.frequencyDays,
      firstPayoutDays: p.payout.firstPayoutDays, verifiedProofs: p.payout.verifiedProofs,
      feeUsdPer100k: p.feeUsdPer100k, platforms: p.platforms,
      publishesRuleChanges: p.transparency.publishesRuleChanges,
      disclosesLegalEntity: p.transparency.disclosesLegalEntity,
      disclosesExecutionBroker: p.transparency.disclosesExecutionBroker,
      logo: p.logo, updatedAt: new Date(),
    };
    await db.insert(schema.props).values(row).onConflictDoUpdate({ target: schema.props.slug, set: row });
    counts.props++;
  }

  for (const e of EXCHANGES) {
    const row = {
      slug: e.slug, name: e.name, founded: e.founded, headquarters: e.headquarters,
      kind: e.kind, why: e.why,
      takerFeePct: e.takerFeePct, makerFeePct: e.makerFeePct, spotVolumeUsd: e.spotVolumeUsd,
      proofOfReserves: e.reserves.proofOfReserves, thirdPartyAudit: e.reserves.thirdPartyAudit,
      publiclyListed: e.reserves.publiclyListed,
      lastBreachYear: e.security.lastBreachYear, insuranceFund: e.security.insuranceFund,
      madeUsersWhole: e.security.madeUsersWhole,
      publishesFeeSchedule: e.transparency.publishesFeeSchedule,
      disclosesLegalEntity: e.transparency.disclosesLegalEntity,
      publishesIncidentReports: e.transparency.publishesIncidentReports,
      logo: e.logo, updatedAt: new Date(),
    };
    await db.insert(schema.exchanges).values(row).onConflictDoUpdate({ target: schema.exchanges.slug, set: row });
    counts.exchanges++;
  }

  return counts;
}

import { eq } from 'drizzle-orm';
const eqSlug = (slug: string) => eq(schema.brokerEntities.brokerSlug, slug);

// Run directly: `node --experimental-strip-types src/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { db, kind, close } = await getDb();
  const counts = await seed(db);
  console.log(`seeded ${kind}:`, counts);
  await close();
}
