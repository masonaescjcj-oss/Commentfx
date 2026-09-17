import { ImageResponse } from 'next/og';
import { volumeBand } from '@commentfx/core';
import { getRankedExchange, rankedExchanges } from '@/lib/repo';
import { recordCard, recordCardSize } from '@/lib/og';

export const size = recordCardSize;
export const contentType = 'image/png';
export const alt = 'Exchange score card';

export default async function Image({ params }: { params: { slug: string } }) {
  const r = getRankedExchange(params.slug);
  if (!r) return new ImageResponse(recordCard({ name: params.slug }), size);
  const e = r.exchange;
  return new ImageResponse(
    recordCard({
      name: e.name,
      score: r.score.total,
      rank: r.rank,
      of: rankedExchanges().length,
      kind: 'Crypto exchange',
      facts: [
        [`${e.takerFeePct}%`, 'taker fee'],
        [volumeBand(e.spotVolumeUsd), '24h volume'],
        [e.reserves.proofOfReserves ? 'Published' : 'None', 'proof of reserves'],
      ],
    }),
    size,
  );
}
