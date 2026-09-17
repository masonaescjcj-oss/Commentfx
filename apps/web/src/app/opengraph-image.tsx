import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

/**
 * What a link to this site looks like when somebody shares it.
 *
 * Until this existed every share — a message, a post, a forum reply — showed a
 * bare URL and nothing else, which is a strange look for a site whose whole
 * argument is that it shows its working. The card is the hero band: the same
 * navy, the same lifted blue, the same sentence.
 *
 * No web font is loaded. `ImageResponse` needs a font as bytes, so using the
 * site's display face would mean shipping a .woff into the build and fetching
 * it at render; the fallback sans is close enough at this size that the
 * difference is not worth the weight or the failure mode.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE.name} — ${SITE.tagline}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: 'linear-gradient(135deg, #081228 0%, #0E1D3D 55%, #12275180 100%)',
          color: '#FFFFFF', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20" cy="18" r="12.4" stroke="#7FA9FF" strokeWidth="7.2"
              strokeDasharray="67.78 77.91" transform="rotate(-190 20 18)"
            />
            <path d="M8.3 25.4 H15.5 V36.2 H8.3 Z" fill="#7FA9FF" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>{SITE.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.035em', maxWidth: 940 }}>
            Rankings that show their working
          </div>
          <div style={{ fontSize: 30, color: '#C3CCDC', lineHeight: 1.45, maxWidth: 900 }}>
            Brokers, prop firms and crypto exchanges — scored on published weights, with every
            licence checked against the regulator’s own register.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['Published weights', 'Licences checked', 'Rank not for sale'].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22, color: '#C3CCDC', padding: '10px 20px', borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
