import { ImageResponse } from 'next/og';
import { liveArticle } from '@/lib/records';
import { SITE } from '@/lib/site';

/**
 * What a shared guide link shows.
 *
 * Until this existed every article shared as the site's generic card — the same
 * picture for five different guides, which tells somebody deciding whether to
 * open a link nothing at all. The record cards already carry the thing worth
 * carrying; for an article that is the question it answers, because the
 * question is what the person pasting the link is arguing about.
 *
 * The diagrams in the article are not on this card. Satori would have to fetch
 * and decode a WebP at render time on a route no page links to, and the first
 * anybody would know of a failure is a blank card in somebody else's chat.
 * Text it can draw from memory.
 *
 * The same Satori rule as `lib/og.tsx` applies: a div with more than one child
 * must declare `display: flex`, and every interpolated string is built before
 * it reaches a node.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Guide';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await liveArticle(slug);

  const heading = a?.heading ?? 'Guides';
  const question = a?.question ?? SITE.tagline;
  const dateline = a ? `Last checked ${a.updated} · ${a.author}` : SITE.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: 'linear-gradient(135deg, #081228 0%, #0E1D3D 55%, #122751 100%)',
          color: '#FFFFFF', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20" cy="18" r="12.4" stroke="#7FA9FF" strokeWidth="7.2"
              strokeDasharray="67.78 77.91" transform="rotate(-190 20 18)"
            />
            <path d="M8.3 25.4 H15.5 V36.2 H8.3 Z" fill="#7FA9FF" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>{SITE.name}</div>
          <div style={{ fontSize: 22, color: '#93A0B6', marginLeft: 8 }}>· Guide</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 62, fontWeight: 700, lineHeight: 1.08,
              letterSpacing: '-0.035em', maxWidth: 980,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: 28, color: '#C3CCDC', lineHeight: 1.45, maxWidth: 940,
              borderLeft: '3px solid #7FA9FF', paddingLeft: 20,
            }}
          >
            {question}
          </div>
        </div>

        <div
          style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 28,
            fontSize: 20, color: '#93A0B6',
          }}
        >
          <div>{dateline}</div>
          <div>Answered in the first two sentences</div>
        </div>
      </div>
    ),
    size,
  );
}
