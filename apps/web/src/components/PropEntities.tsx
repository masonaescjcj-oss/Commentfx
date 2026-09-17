import Link from 'next/link';
import type { PropFirm, PropEntity } from '@commentfx/core';
import { countryName } from '@commentfx/core';
import { Card, CardHead, Tag } from './primitives';
import { Flag } from './Flag';

/**
 * Which companies are involved, and what each one is for.
 *
 * The broker side of this site has an entity map because the licence in the
 * marketing is rarely the licence you get. Prop firms have the same problem
 * with none of the anchors: no licence, no register, no regulator to ask. The
 * only checkable thing is the list of companies the firm names in its own
 * terms — so that is what this renders, and where a firm names none, it says
 * that instead of drawing an empty box.
 *
 * The roles are not decoration. A trader who is refused a payout needs to know
 * which company owes them, and "FundedNext" is not an answer: the payment went
 * to a Cyprus company, the account ran on a Comoros company, and the terms were
 * with a free-zone company in Ajman. Three jurisdictions, three different
 * afternoons in front of three different courts.
 */
const ROLE: Record<PropEntity['role'], { label: string; note: string }> = {
  contracting: {
    label: 'Your contract',
    note: 'The company whose terms you accept when you buy the challenge',
  },
  trading: {
    label: 'Your account',
    note: 'The company that runs the evaluation and the funded account',
  },
  payments: {
    label: 'Your money',
    note: 'The company that takes the fee or sends the payout',
  },
  group: {
    label: 'Also named',
    note: 'Named by the firm, doing something other than the three above',
  },
  dissolved: {
    label: 'Dissolved',
    note: 'Named in the firm’s own material and no longer on the register',
  },
};

/** Contract, account, money, then everything else. */
const ORDER: Record<PropEntity['role'], number> = {
  contracting: 0, trading: 1, payments: 2, group: 3, dissolved: 4,
};

export function PropEntities({ firm }: { firm: PropFirm }) {
  const entities = [...firm.entities].sort((a, b) => ORDER[a.role] - ORDER[b.role]);

  return (
    <Card className="p-4 lg:p-6" as="section" id="entities">
      <CardHead
        title="Who you are actually dealing with"
        aside={<span className="text-[11.5px] text-ink-3">{entities.length || '—'}</span>}
      />

      {entities.length === 0 ? (
        <p className="text-[13px] leading-[1.75] text-ink-2 max-w-[62ch]">
          Nobody here has read {firm.name}’s terms for the companies behind them. Until somebody
          has, this says nothing rather than guessing — the country in the header is where the
          firm says it is based, which is not the same as the company you would be contracting
          with.
        </p>
      ) : (
        <>
          <ul className="flex flex-col">
            {entities.map((e) => (
              <li
                key={`${e.legalName}-${e.country}-${e.role}`}
                className="flex items-start gap-3 py-3 border-b border-line-2 last:border-b-0"
              >
                <span className="pt-[3px] shrink-0">
                  <Flag code={e.country} w={18} title={countryName(e.country)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold leading-[1.4] break-words">
                    {e.legalName}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-[7px] gap-y-1 text-[11.5px] text-ink-3 mt-[5px]">
                    <Tag tone={e.role === 'dissolved' ? 'warn' : 'neutral'}>{ROLE[e.role].label}</Tag>
                    <span>{countryName(e.country)}</span>
                    {e.registration ? (
                      <>
                        <span aria-hidden className="text-line">·</span>
                        <span className="tnum">{e.registration}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-[12px] leading-[1.7] text-ink-2 mt-[6px] max-w-[58ch]">
                    {ROLE[e.role].note}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-4 pt-3 border-t border-line-2 max-w-[64ch]">
            Read off the firm’s own terms and, where one exists, the company register of the
            country named. A prop firm holds no financial licence, so there is no regulator to
            check these against — which is the reason to know the names rather than a reason not
            to publish them.{' '}
            <Link href="/learn/who-is-behind-your-prop-firm" className="text-accent font-semibold">
              How to check this yourself
            </Link>.
          </p>
        </>
      )}
    </Card>
  );
}
