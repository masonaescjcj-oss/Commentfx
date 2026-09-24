import type { ReactElement } from 'react';
import { SITE } from './site';

/**
 * The card a shared record link shows.
 *
 * One function for all three verticals, because the thing worth putting on a
 * card is the same for each: what this is, what we scored it, and where that
 * puts it. A card that repeated the page title would be a picture of a URL.
 *
 * The score is the point. Somebody pastes a broker link into a chat and the
 * answer arrives with it, which is the only reason this is worth the build
 * time — 26 records, generated once and cached.
 *
 * Every string interpolated into a node is built before it gets there, never
 * assembled out of JSX children. Satori refuses a div with more than one child
 * that has not declared `display: flex`, and `RANK #{rank} OF {of}` is four
 * children rather than one sentence — which fails at render, on a route no
 * page links to, so the first anybody would know is a blank card in somebody
 * else's chat window.
 */
export const recordCardSize = { width: 1200, height: 630 };

export interface RecordCard {
  name: string;
  score?: number;
  rank?: number;
  of?: number;
  kind?: string;
  /** Up to three [value, label] pairs along the bottom. */
  facts?: Array<[string, string]>;
  /**
   * The line in the bottom corner. It says the record was scored, which is
   * true of every ranked record and false of a sponsor — so a card that is not
   * a score says what it is instead.
   */
  footnote?: string;
}

/** Above 7.5 reads as good, below 6 as a warning — the same bands the site uses. */
const tone = (score: number) => (score >= 7.5 ? '#4ADE80' : score >= 6 ? '#FBBF24' : '#F87171');

export function recordCard({ name, score, rank, of, kind, facts = [], footnote = 'Scored on published weights' }: RecordCard): ReactElement {
  return (
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
        {kind && (
          <div style={{ fontSize: 22, color: '#93A0B6', marginLeft: 8 }}>{`· ${kind}`}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rank !== undefined && of !== undefined && (
            <div style={{ fontSize: 26, fontWeight: 700, color: '#7FA9FF', letterSpacing: '0.06em' }}>
              {`RANK #${rank} OF ${of}`}
            </div>
          )}
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', maxWidth: 700 }}>
            {name}
          </div>
        </div>

        {score !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.05em', color: tone(score) }}>
              {score.toFixed(1)}
            </div>
            <div style={{ fontSize: 24, color: '#93A0B6', marginTop: 6 }}>out of 10</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 48, borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 28 }}>
        {facts.map(([value, label]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: 20, color: '#93A0B6' }}>{label}</div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 20, color: '#93A0B6', alignSelf: 'flex-end' }}>
          {footnote}
        </div>
      </div>
    </div>
  );
}
