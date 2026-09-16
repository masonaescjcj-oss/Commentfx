import type { BrokerProfile, Source } from '@commentfx/core';
import { Card, CardHead, Tag } from './primitives';

/**
 * The researched half of a broker page.
 *
 * Everything above it on the page is computed from the record. This is the part
 * a person wrote after reading filings, and the whole reason it is allowed on a
 * site that otherwise refuses hand-written prose is the apparatus around it:
 * every claim carries a source id, every source carries the day it was read,
 * and the list at the bottom is a reader's route to checking us rather than
 * trusting us.
 *
 * The citations render as numbered links into that list. Not superscript
 * daggers or hover cards — a link with a number in it, big enough to hit with a
 * thumb, that moves the page to the source. A citation nobody can follow is
 * decoration.
 */
const CITE = /\[([a-z0-9-]+)\]/g;

const KIND: Record<Source['kind'], string> = {
  register: 'Regulator’s register',
  filing: 'Statutory filing',
  regulator: 'Regulator notice',
  press: 'Trade press',
  broker: 'The broker’s own page',
};

/** Primary evidence first, then everything else, in the order it was cited. */
const WEIGHT: Record<Source['kind'], number> = {
  filing: 0, register: 1, regulator: 2, press: 3, broker: 4,
};

const asDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

function Cited({ text, index }: { text: string; index: Map<string, number> }) {
  const out: Array<string | React.ReactElement> = [];
  let at = 0;
  for (const m of text.matchAll(CITE)) {
    const i = m.index;
    const id = m[1] ?? '';
    if (i > at) out.push(text.slice(at, i));
    at = i + m[0].length;
    out.push(
      <a
        key={`${id}-${i}`}
        href={`#source-${id}`}
        aria-label={`Source ${index.get(id) ?? '?'}`}
        className="inline-block align-super text-[10.5px] font-bold tnum text-accent px-[3px] py-[6px] -my-[6px] hover:underline"
      >
        {index.get(id) ?? '?'}
      </a>,
    );
  }
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}

export function Profile({ profile, name }: { profile: BrokerProfile; name: string }) {
  const sources = [...profile.sources].sort((a, b) => WEIGHT[a.kind] - WEIGHT[b.kind]);
  const index = new Map(sources.map((s, i) => [s.id, i + 1]));

  return (
    <>
      <Card className="p-4 lg:p-6" as="section" id="research">
        <CardHead
          title={`What we checked on ${name}`}
          aside={<span className="text-[11.5px] text-ink-3">{asDate(profile.checked)}</span>}
        />

        <p className="text-[15px] leading-[1.8] text-ink-2 max-w-[68ch] border-l-[3px] border-accent pl-4">
          {profile.verdict}
        </p>

        {profile.sections.map((s) => (
          <section key={s.heading} className="mt-6 pt-6 border-t border-line-2">
            <h3 className="font-[family-name:var(--font-display)] text-[17px] lg:text-[18px] font-bold tracking-[-0.022em] leading-[1.3] mb-3 text-balance">
              {s.heading}
            </h3>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-[14.5px] leading-[1.8] text-ink-2 mb-3 last:mb-0 max-w-[68ch]">
                <Cited text={p} index={index} />
              </p>
            ))}
          </section>
        ))}
      </Card>

      {/* The numbers, apart from the argument about them, so a reader who
          wants only the evidence can take it and go. */}
      <Card className="p-4 lg:p-6" as="section" id="evidence">
        <CardHead title="The figures, and where each one came from" />
        <dl>
          {profile.facts.map((f) => (
            <div key={f.label} className="flex justify-between items-baseline gap-4 py-[10px] border-b border-line-2 last:border-b-0">
              <dt className="text-[12.5px] text-ink-3 leading-[1.6]">
                {f.label}
                <a href={`#source-${f.from}`} className="inline-block align-super text-[10px] font-bold tnum text-accent ml-[3px] px-[3px] py-[6px] -my-[6px]">
                  {index.get(f.from)}
                </a>
              </dt>
              <dd className="text-[13px] font-semibold tnum text-right shrink-0">{f.value}</dd>
            </div>
          ))}
        </dl>

        {profile.open.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-[10px]">
              Still open
            </h3>
            <ul className="flex flex-col gap-2">
              {profile.open.map((o) => (
                <li key={o.slice(0, 40)} className="text-[12.5px] text-ink-2 leading-[1.75] pl-5 relative max-w-[66ch]">
                  <span aria-hidden className="absolute left-0 top-[9px] w-[6px] h-[6px] rounded-full bg-warn" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="p-4 lg:p-6" as="section" id="sources">
        <CardHead title="Sources" aside={<span className="text-[11.5px] text-ink-3">{sources.length}</span>} />
        <ol className="flex flex-col">
          {sources.map((s, i) => (
            <li key={s.id} id={`source-${s.id}`} className="flex gap-3 py-3 border-b border-line-2 last:border-b-0">
              <span className="text-[12px] font-bold tnum text-ink-3 w-[16px] shrink-0 pt-[2px]">{i + 1}</span>
              <div className="min-w-0">
                <a
                  href={s.url}
                  rel="nofollow noopener"
                  target="_blank"
                  className="text-[13.5px] font-semibold leading-[1.45] hover:text-accent break-words"
                >
                  {s.title}
                </a>
                <p className="flex flex-wrap items-center gap-x-[7px] gap-y-1 text-[11.5px] text-ink-3 mt-[5px]">
                  <span className="font-semibold text-ink-2">{s.publisher}</span>
                  <Tag tone="neutral">{KIND[s.kind]}</Tag>
                  {s.published ? <span>published {asDate(s.published)}</span> : null}
                  <span aria-hidden className="text-line">·</span>
                  <span>read {asDate(s.read)}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-4 pt-3 border-t border-line-2 max-w-[66ch]">
          Every link goes to the document, not to a summary of it. They carry <code>nofollow</code> like
          every other outbound link here, and none of them is an affiliate link — a source you are paid
          to cite is not a source.
        </p>
      </Card>
    </>
  );
}
