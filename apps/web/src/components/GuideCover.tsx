import type { Article, ArticleTopic } from '@commentfx/core';

/**
 * The picture at the top of a guide's card.
 *
 * A guide's own first diagram where it has one — that is the most honest
 * picture of what is inside, and it is already drawn on the band's navy. A
 * guide with no diagram gets a drawing of its subject instead — a licence, a
 * cost, a company — line-drawn on the same navy, so the covers read as one set
 * rather than as stock art. Inline SVG, so a cover costs no request and cannot arrive late.
 *
 * Decorative in both cases: the card's heading says what the guide is, and an
 * alt that repeated it would make a screen reader read the title twice.
 */
export function GuideCover({ article, className }: {
  article: Pick<Article, 'blocks' | 'topic' | 'slug'>;
  /** Sets the height; the cover always takes the card's width. */
  className: string;
}) {
  const figure = article.blocks.find((b) => b.figure)?.figure;
  if (figure) {
    return (
      <img
        src={figure.src}
        alt=""
        width={figure.w}
        height={figure.h}
        loading="lazy"
        decoding="async"
        className={`block w-full object-cover object-[center_42%] bg-[#081228] ${className}`}
      />
    );
  }
  return <Art motif={motifFor(article.slug, article.topic)} className={className} />;
}

type Motif = 'licence' | 'cost' | 'entity' | 'company' | 'drawdown' | 'reserves';

/**
 * What the drawing shows, from what the guide is about. Read off the slug
 * because the slug is the one field written to say the subject in a few words;
 * a guide whose slug matches none of these gets its list's own mark, so a new
 * guide always has a cover even before anyone draws one for it.
 */
function motifFor(slug: string, topic: ArticleTopic): Motif {
  if (/licen[cs]e|regulat|register/.test(slug)) return 'licence';
  if (/spread|cost|fee|commission/.test(slug)) return 'cost';
  if (/entity|signing/.test(slug)) return 'entity';
  if (/behind|company|owner/.test(slug)) return 'company';
  if (/drawdown|challenge|rule/.test(slug)) return 'drawdown';
  if (/reserve|solven|custody/.test(slug)) return 'reserves';
  return topic === 'brokers' ? 'licence' : topic === 'props' ? 'drawdown' : 'reserves';
}

const GLOW: Record<Motif, [number, number]> = {
  licence: [40, 170], cost: [320, 160], entity: [180, -30], company: [300, -10], drawdown: [310, 170], reserves: [60, -20],
};

function Art({ motif, className }: { motif: Motif; className: string }) {
  const [gx, gy] = GLOW[motif];
  return (
    <svg
      viewBox="0 0 360 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={`block w-full bg-[#081228] ${className}`}
    >
      <rect width="360" height="160" fill="#081228" />
      <circle cx={gx} cy={gy} r="130" fill="rgb(56 110 255 / 0.22)" />
      <path d="M0 40h360M0 80h360M0 120h360" stroke="#1E2A45" strokeWidth="1" />
      <g fill="none" stroke="#7FA9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {motif === 'licence' ? (
          <>
            {/* A shield with a tick: a licence that checks out. */}
            <path d="M180 30l40 16v26c0 22-17 38-40 48-23-10-40-26-40-48V46z" />
            <path d="M163 76l12 12 24-24" strokeWidth="3" />
          </>
        ) : motif === 'cost' ? (
          <>
            {/* Spread and commission: two bars that come to one total. */}
            <rect x="126" y="56" width="40" height="60" rx="6" />
            <rect x="194" y="86" width="40" height="30" rx="6" fill="rgb(127 169 255 / 0.25)" />
            <path d="M110 124h140M146 44v6M214 74v6" />
          </>
        ) : motif === 'entity' ? (
          <>
            {/* One brand, several companies under it. */}
            <circle cx="180" cy="44" r="12" fill="rgb(127 169 255 / 0.25)" />
            <path d="M180 56v14M114 86V70h132v16M158 70v16M202 70v16" />
            <rect x="100" y="90" width="28" height="22" rx="5" /><rect x="144" y="90" width="28" height="22" rx="5" />
            <rect x="188" y="90" width="28" height="22" rx="5" /><rect x="232" y="90" width="28" height="22" rx="5" />
          </>
        ) : motif === 'company' ? (
          <>
            {/* The company on the contract. */}
            <path d="M128 122V70l52-26 52 26v52M114 122h132" />
            <path d="M152 122V92h56v30M148 80h64" opacity="0.6" />
            <circle cx="180" cy="62" r="5" fill="#7FA9FF" stroke="none" />
          </>
        ) : motif === 'drawdown' ? (
          <>
            {/* A balance line, the target above it and the floor below. */}
            <path d="M110 112h140" stroke="#D9604A" opacity="0.8" />
            <path d="M110 44h140" stroke="#5FD3A6" opacity="0.8" />
            <path d="M110 84l22-14 18 10 20-24 16 12 22-26 20 8 22-12" strokeWidth="2.5" />
          </>
        ) : (
          <>
            {/* Reserves against liabilities: two stacks. */}
            <ellipse cx="150" cy="54" rx="26" ry="8" />
            <path d="M124 54v50c0 4 12 8 26 8s26-4 26-8V54M124 70c0 4 12 8 26 8s26-4 26-8M124 86c0 4 12 8 26 8s26-4 26-8" />
            <ellipse cx="214" cy="78" rx="26" ry="8" opacity="0.6" />
            <path d="M188 78v26c0 4 12 8 26 8s26-4 26-8V78" opacity="0.6" />
          </>
        )}
      </g>
    </svg>
  );
}
