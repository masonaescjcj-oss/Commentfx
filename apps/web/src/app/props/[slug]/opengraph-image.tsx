import { ImageResponse } from 'next/og';
import { describeDrawdown } from '@commentfx/core';
import { getRankedProp, rankedProps } from '@/lib/repo';
import { recordCard, recordCardSize } from '@/lib/og';
import { sponsorBySlug } from '@/lib/sponsors';

export const size = recordCardSize;
export const contentType = 'image/png';
export const alt = 'Prop firm score card';

export default async function Image({ params }: { params: { slug: string } }) {
  // A sponsor's card carries its terms and no score, and says it is sponsored
  // where a ranked record's card says it was scored.
  const sponsor = sponsorBySlug(params.slug);
  if (sponsor) {
    return new ImageResponse(
      recordCard({
        name: sponsor.name,
        kind: 'Sponsored listing',
        facts: [
          [sponsor.from.price, `${sponsor.from.account} challenge from`],
          ['Up to 90%', 'profit split'],
          ['14 days', 'between payouts'],
        ],
        footnote: 'Sponsored — not scored',
      }),
      size,
    );
  }
  const r = getRankedProp(params.slug);
  if (!r) return new ImageResponse(recordCard({ name: params.slug }), size);
  const f = r.firm;
  return new ImageResponse(
    recordCard({
      name: f.name,
      score: r.score.total,
      rank: r.rank,
      of: rankedProps().length,
      kind: 'Prop firm',
      facts: [
        [`${f.payout.splitPct}%`, 'split when funded'],
        [describeDrawdown(f.rules.drawdownType), 'drawdown'],
        [`$${f.feeUsdPer100k}`, 'per $100k'],
      ],
    }),
    size,
  );
}
