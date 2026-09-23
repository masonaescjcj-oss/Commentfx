import type { Source } from './profiles.ts';

/**
 * The shape of a hand-researched record, shared by every vertical that has one.
 *
 * Prop firms got this layer first and exchanges needed exactly the same thing:
 * a verdict, some sections that argue, facts a reader can check, the questions
 * the research did not close, and sources carrying the day each was read. The
 * second copy was going to be a paste of the first, and a third would have made
 * it three sets of nearly-identical rules drifting apart at their own speeds —
 * the same reason the enforcement register is one table rather than one per
 * vertical.
 *
 * Brokers keep their own `BrokerProfile` for now. It predates this and carries
 * the same fields under different names; folding it in is a rename worth doing
 * on a quiet afternoon rather than in the middle of research.
 */
export interface ResearchFact {
  label: string;
  value: string;
  /** Source.id */
  from: string;
}

export interface ResearchSection {
  heading: string;
  paragraphs: string[];
}

export interface ResearchProfile {
  slug: string;
  /** The day a person did this research. */
  checked: string;
  /**
   * The day the published text last changed, when that is later than the
   * research — a correction, not a re-check. Kept apart from `checked` because
   * moving that date to announce an edit would claim research nobody did.
   */
  revised?: string;
  /**
   * Whether the company's own pages answered us at all.
   *
   * Set true only when a person here opened the company's own pages and read
   * them; a review site repeating the same figures does not satisfy it. It is
   * a fact about the evidence behind a record rather than about the company,
   * and it feeds the `evidence` component of a score.
   */
  originReadable: boolean;
  verdict: string;
  sections: ResearchSection[];
  facts: ResearchFact[];
  /** Questions this research opened and did not close. */
  open: string[];
  sources: Source[];
}

const CITE = /\[([a-z0-9-]+)\]/g;

/** Every source id a profile's prose refers to. */
export function researchCitations(p: ResearchProfile): string[] {
  const text = p.sections.flatMap((s) => s.paragraphs).join(' ');
  return [...new Set([...text.matchAll(CITE)].map((m) => m[1]!))];
}

/** What a reader actually gets, with the citation marks taken back out. */
export function researchWordCount(p: ResearchProfile): number {
  return p.sections
    .flatMap((s) => s.paragraphs)
    .join(' ')
    .replace(CITE, '')
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * The part of a profile a score reads. Structural, so a scoring file never has
 * to import the data file that imports it.
 */
export interface EvidenceInput {
  originReadable: boolean;
  sources: Array<{ kind: string }>;
}

/**
 * How much of a record anybody has been able to confirm, out of ten.
 *
 * Four points for a record somebody researched and wrote up at all; three more
 * if the company's own pages answered, so its figures were read where they are
 * published rather than where somebody else repeated them; three more if an
 * independent document — a register, a filing, a regulator's own notice —
 * names the company.
 *
 * Null when nobody has researched it, which excludes the component and
 * renormalises the rest rather than scoring it zero. Same rule as conduct: no
 * data is not a bad score, it is no score.
 */
export function evidenceScore(profile?: EvidenceInput): number | null {
  if (!profile) return null;
  const independent = profile.sources.some(
    (s) => s.kind === 'register' || s.kind === 'filing' || s.kind === 'regulator',
  );
  return 4 + (profile.originReadable ? 3 : 0) + (independent ? 3 : 0);
}

/**
 * What the evidence number is saying, in the reader's terms.
 *
 * The wording is deliberately about what was read rather than about why. An
 * earlier version said the company's pages "refuse our requests", which is true
 * of four prop firms and false of every exchange — there nobody tried, because
 * the documents worth reading were a consent order and a charging document. A
 * note that guesses at a reason is a note that will be wrong about half its
 * subjects.
 */
export function evidenceNote(profile?: EvidenceInput): string {
  if (!profile) return 'Nobody has researched this record yet';
  const independent = profile.sources.some(
    (s) => s.kind === 'register' || s.kind === 'filing' || s.kind === 'regulator',
  );
  if (profile.originReadable && independent) return 'Read at the company’s own pages and against an outside document';
  if (profile.originReadable) return 'Read at the company’s own pages; no outside document names it';
  if (independent) return 'Read against an outside document, not at the company’s own pages';
  return 'Neither the company’s own pages nor an outside document was read';
}
