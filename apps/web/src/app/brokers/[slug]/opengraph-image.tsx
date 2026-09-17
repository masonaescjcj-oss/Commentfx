import { ImageResponse } from 'next/og';
import { countryName } from '@commentfx/core';
import { getRanked, rankedBrokers } from '@/lib/repo';
import { recordCard, recordCardSize } from '@/lib/og';

export const size = recordCardSize;
export const contentType = 'image/png';
export const alt = 'Broker score card';

export default async function Image({ params }: { params: { slug: string } }) {
  const r = getRanked(params.slug);
  if (!r) return new ImageResponse(recordCard({ name: params.slug }), size);
  return new ImageResponse(
    recordCard({
      name: r.broker.name,
      score: r.score.total,
      rank: r.rank,
      of: rankedBrokers().length,
      kind: 'Forex broker',
      facts: [
        [`${r.broker.entities.length}`, r.broker.entities.length === 1 ? 'company' : 'companies'],
        [countryName(r.broker.headquarters), 'headquarters'],
        [`${r.broker.founded}`, 'founded'],
      ],
    }),
    size,
  );
}
