import { REGULATORS, type Broker } from '@commentfx/core';
import { Tag } from './primitives';
import { Flag } from './Flag';
import { checkKey, READABLE, BLOCKED_REASON, type CheckMap, type CheckKind } from '@/lib/registers';

const DAY = 86_400_000;
const age = (iso: string) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / DAY));

const CHECK: Record<CheckKind, { tone: 'good' | 'warn' | 'bad' | 'neutral'; label: string }> = {
  confirmed: { tone: 'good', label: 'On the register' },
  'name-mismatch': { tone: 'warn', label: 'Name differs' },
  'not-found': { tone: 'bad', label: 'Not on the register' },
  'source-unavailable': { tone: 'neutral', label: 'Register unreachable' },
};

/**
 * The licences a broker claims, each against what the regulator's own register
 * says. This is a machine reading a public register once a day — a different,
 * weaker thing than an editor verification, and labelled as such. A regulator
 * whose register we cannot read says so, because "unchecked" and "checked and
 * fine" must never look alike.
 */
export function LicenceList({ broker, checks }: { broker: Broker; checks: CheckMap }) {
  const checked = broker.entities.filter((e) => checks[checkKey(e.licence.regulator, e.licence.number)]);
  const newest = checked
    .map((e) => checks[checkKey(e.licence.regulator, e.licence.number)]!.checkedAt)
    .sort()
    .at(-1);

  return (
    <>
      <ul>
        {broker.entities.map((e) => {
          const reg = REGULATORS[e.licence.regulator];
          const tone = reg?.tier === 'A' ? 'good' : reg?.tier === 'B' ? 'warn' : 'neutral';
          const check = checks[checkKey(e.licence.regulator, e.licence.number)];
          const meta = check ? CHECK[check.kind] : null;

          return (
            <li key={e.legalName} className="py-[11px] border-b border-line-2 last:border-b-0">
              <div className="flex items-center gap-[10px]">
                <span className={`w-[22px] h-5 grid place-items-center rounded-[5px] text-[10.5px] font-extrabold shrink-0 ${
                  reg?.tier === 'A' ? 'bg-up-bg text-up' : reg?.tier === 'B' ? 'bg-warn-bg text-warn' : 'bg-card-3 text-ink-2'}`}>
                  {reg?.tier ?? '?'}
                </span>
                <Flag code={e.country} w={20} title={e.country} />
                <span className="min-w-0">
                  <span className="text-[13.5px] font-bold">{e.licence.regulator}</span>{' '}
                  <span className="text-[11.5px] text-ink-3 tnum">{e.licence.number}</span>
                </span>
                <div className="flex-1" />
                <Tag tone={tone}>{e.licence.status}</Tag>
              </div>

              <p className="text-[11.5px] leading-[1.7] mt-[6px] pl-[32px]">
                {meta && check ? (
                  <>
                    <Tag tone={meta.tone}>{meta.label}</Tag>{' '}
                    <span className={check.kind === 'confirmed' ? 'text-ink-3' : 'text-ink-2'}>
                      {check.kind === 'confirmed' && check.registerName
                        ? `as “${check.registerName}”`
                        : check.detail}
                    </span>{' '}
                    <span className="text-ink-3 tnum">· read {age(check.checkedAt)}d ago</span>
                  </>
                ) : READABLE.has(e.licence.regulator) ? (
                  <span className="text-ink-3">Not read yet — the next register run will check it.</span>
                ) : (
                  <span className="text-ink-3">
                    No automated check: {BLOCKED_REASON[e.licence.regulator]
                      ?? 'we have no reader for this register yet'}. Check it yourself at{' '}
                    {reg?.registryUrl ? (
                      <a href={reg.registryUrl} rel="nofollow noopener external" target="_blank" className="text-brass">
                        the {e.licence.regulator} register
                      </a>
                    ) : 'the regulator’s register'}.
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-[11.5px] text-ink-3 mt-[10px] leading-[1.75]">
        Tier A runs a statutory compensation scheme and a public register. Tier C is
        registration only — in practice, no recourse.
        {newest && ` Register readings are automated and were last refreshed ${age(newest)} days ago; a reading is not an editor verification.`}
      </p>
    </>
  );
}
