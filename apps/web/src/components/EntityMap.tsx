import { REGULATORS, countryName, servesRetail, type Broker, type BrokerEntity } from '@commentfx/core';
import { Flag } from './Flag';

/**
 * The entity map, without the country picker it used to open with.
 *
 * The picker asked the reader where they lived and highlighted one row. It
 * looked helpful and it was doing two things badly: the list of countries in it
 * was eight, chosen by us, so most readers picked the nearest wrong one and got
 * a confident answer about an entity that was not theirs. And it made this the
 * only client component on the page — a select, a state hook and a hydration
 * pass, to reorder information that was already all on the screen.
 *
 * What a reader actually needs is the shape: which companies exist, which
 * regulator each one answers to, and what standing behind it. Who gets which is
 * decided at sign-up by the country on the form, and the honest version of that
 * is the row that says "everyone else" — not a dropdown pretending to know.
 *
 * So it renders on the server now, with no JavaScript at all.
 */
function serves(e: BrokerEntity): string {
  if (!servesRetail(e)) return 'Other firms, not retail clients';
  if (e.serves.includes('*')) return 'Everyone not covered above';
  if (e.serves.length === 0) {
    return e.brand
      ? `Clients of ${e.brand}, which is a different site`
      : 'Nobody this page sends you to';
  }
  // Four names and a count. The full list is seven countries on some entities,
  // and a paragraph of country names is the thing nobody reads.
  const names = e.serves.map(countryName);
  return names.length <= 4
    ? names.join(', ')
    : `${names.slice(0, 4).join(', ')} and ${names.length - 4} more`;
}

export function EntityMap({ broker }: { broker: Broker }) {
  return (
    <ul className="flex flex-col gap-2">
      {broker.entities.map((e) => {
        const reg = REGULATORS[e.licence.regulator];
        const retail = servesRetail(e);
        /**
         * A compensation scheme belongs to the clients of the company holding
         * the licence. An entity that takes no retail client has one, and it is
         * not the reader's — "FSCS up to £85,000" printed in green beside
         * Exness (UK) Ltd told a British reader they were covered by a scheme
         * they can never claim on.
         */
        const unlicensed = e.licence.status === 'unregulated';
        /**
         * Name what is claimed, not just what is missing.
         *
         * "No financial licence" is true of Alpari and says nothing about the
         * interesting part, which is that it publishes a licence number from a
         * body the Comoros central bank calls fictitious. A reader who has seen
         * that number on the broker's own footer needs this row to be about
         * that number.
         */
        const protection = unlicensed
          ? REGULATORS[e.licence.regulator]
            ? 'Registered only — no financial licence for this business'
            : `Claims a licence from ${e.licence.regulator}, which is not a financial regulator`
          : !retail
            ? 'Takes no retail clients — this licence is not yours'
            : reg?.compensation ?? 'No investor compensation scheme';
        const fallback = retail && e.serves.includes('*');

        return (
          <li
            key={e.legalName}
            className={
              // The fallback entity is the one most readers end up with, so it
              // is the one carrying the emphasis — a fact about the broker,
              // not a guess about the reader.
              fallback
                ? 'border-[1.5px] border-warn bg-[#FFFBF1] rounded-[13px] p-[12px_13px]'
                : 'border border-line bg-card-2 rounded-[13px] p-[12px_13px]'
            }
          >
            <div className="flex items-center gap-2">
              <Flag code={e.country} w={20} title={e.country} />
              <span className={`text-[13.5px] ${fallback ? 'font-bold' : 'font-semibold text-ink-2'}`}>
                {e.legalName}
              </span>
              <div className="flex-1" />
              {e.brand ? (
                <span className="text-[10.5px] font-bold text-ink-3 border border-line rounded-md px-[7px] py-[2px]">
                  {e.brand}
                </span>
              ) : null}
              {!retail && (
                <span className="text-[10.5px] font-bold text-ink-3 border border-line rounded-md px-[7px] py-[2px]">
                  B2B
                </span>
              )}
              {fallback && (
                <span className="text-[10.5px] font-extrabold text-white bg-warn px-[9px] py-[2px] rounded-md">
                  MOST READERS
                </span>
              )}
            </div>

            <p className={`text-[11.5px] mt-2 ${fallback ? 'font-bold' : ''} ${
              unlicensed ? 'text-down font-bold' : retail && reg?.compensation ? 'text-up' : 'text-warn'}`}>
              {protection}
            </p>
            <p className="text-[11.5px] text-ink-3 mt-[3px]">
              {unlicensed
                ? `${countryName(e.country)} · ${e.licence.regulator} ${e.licence.number}`
                : `${reg?.name ?? e.licence.regulator} · licence ${e.licence.number}`}
            </p>
            <p className="text-[11.5px] text-ink-3 mt-[2px]">
              Takes: {serves(e)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
