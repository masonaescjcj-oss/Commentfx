import { ImageResponse } from 'next/og';
import { describeDrawdown } from '@commentfx/core';
import { getRankedProp, rankedProps } from '@/lib/repo';
import { recordCard, recordCardSize } from '@/lib/og';

export const size = recordCardSize;
export const contentType = 'image/png';
export const alt = 'Prop firm score card';

export default async function Image({ params }: { params: { slug: string } }) {
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
