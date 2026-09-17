import { countryName, type EnforcementAction, type ActionStage } from '@commentfx/core';
import { Card, CardHead, Tag } from './primitives';
import { Flag } from './Flag';

/**
 * What authorities have done, above everything good about the broker.
 *
 * Placement is the argument. Put this below the score and the pricing and it
 * reads as a footnote to a recommendation; put it above them and the page says
 * what it actually thinks a reader should weigh first. A prosecution is not a
 * detail of a broker that is otherwise fifth of ten.
 *
 * The stage label is the load-bearing part and it is never softened. An
 * allegation says alleged however serious the sum attached to it, because a
 * filed complaint is the start of a case; a decided action says decided; one
 * under appeal says so. Calling a charge a finding would be as wrong as burying
 * a finding in the word "claims", and the second mistake is the one review
 * sites make.
 *
 * "Dismissed" is the fourth and it is the one this component exists to get
 * right as much as any of them. The SEC sued Coinbase and Kraken and dropped
 * both, with prejudice and with no penalty. Rendering that in the same red as
 * a guilty plea would tell a reader the opposite of what happened, so it is
 * the only stage drawn in the good tone — a case that ended in the company's
 * favour reads as one.
 */
const STAGE: Record<ActionStage, { tone: 'bad' | 'warn' | 'neutral' | 'good'; label: string; gloss: string }> = {
  alleged: { tone: 'warn', label: 'Alleged', gloss: 'Filed or charged. Nothing decided.' },
  decided: { tone: 'bad', label: 'Decided', gloss: 'The authority made this finding.' },
  'under-appeal': { tone: 'warn', label: 'Under appeal', gloss: 'Decided, and being challenged.' },
  dismissed: { tone: 'good', label: 'Dismissed', gloss: 'Brought and dropped. Nothing decided against the firm.' },
};

const asDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

export function ActionList({ actions, name }: { actions: EnforcementAction[]; name: string }) {
  if (actions.length === 0) return null;

  return (
    <Card className="p-4 lg:p-6 border-[1.5px] border-warn shadow-none" as="section" id="actions">
      <CardHead
        title={`On the record against ${name}`}
        aside={<span className="text-[11.5px] text-ink-3">{actions.length}</span>}
      />

      <ul className="flex flex-col gap-4">
        {actions.map((a) => {
          const stage = STAGE[a.stage];
          return (
            <li key={`${a.authority}-${a.date}`} className="border-t border-line-2 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Flag code={a.country} w={20} title={a.country} />
                <span className="text-[13.5px] font-bold">{a.authority}</span>
                <Tag tone={stage.tone}>{stage.label}</Tag>
                <span className="text-[11.5px] text-ink-3">{asDate(a.date)}</span>
              </div>

              <p className="text-[13.5px] leading-[1.7] text-ink-2 mt-2 max-w-[68ch]">{a.summary}</p>
              <p className="text-[12.5px] leading-[1.75] text-ink-3 mt-2 max-w-[68ch]">{a.detail}</p>

              <p className="text-[11.5px] text-ink-3 mt-[10px]">
                <a href={a.sourceUrl} rel="nofollow noopener" target="_blank" className="text-accent font-semibold">
                  {a.sourcePublisher}
                </a>
                {a.primary ? ' — the authority’s own document' : ' — reported, not the source document'}
                {' · '}
                {countryName(a.country)}
                {' · '}
                {stage.gloss}
              </p>
            </li>
          );
        })}
      </ul>

      {/* The gap, said out loud. A score that silently priced this in would be
          an unpublished weight, which is the thing this site refuses. */}
      <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-5 pt-4 border-t border-line max-w-[66ch]">
        None of this moves the score on this page. The weights are published on{' '}
        <a href="/methodology" className="text-accent font-semibold">the methodology page</a> and they read
        licences, costs, payments, platforms and disclosures — there is no component for what an authority
        has done, and adding a penalty nobody could see would be worse than the gap. It is written here
        instead, above everything good about this broker, which is where we think it belongs.
      </p>
    </Card>
  );
}
