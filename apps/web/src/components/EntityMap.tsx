'use client';

import { useState } from 'react';
import { REGULATORS, servesRetail, type Broker } from '@commentfx/core';
import { Flag } from './Flag';

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' }, { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'SG', name: 'Singapore' },
  { code: 'BR', name: 'Brazil' }, { code: 'IN', name: 'India' },
];

/**
 * Every entity is rendered into the HTML whatever is selected — the picker only
 * changes which one is highlighted. Crawlers and readers with JS off still get
 * the whole map, which is the part that matters.
 */
export function EntityMap({ broker }: { broker: Broker }) {
  const [country, setCountry] = useState('SG');
  const match =
    broker.entities.find((e) => e.serves.includes(country)) ??
    broker.entities.find((e) => e.serves.includes('*')) ??
    broker.entities[broker.entities.length - 1];

  return (
    <>
      <div className="flex items-center gap-[10px] mb-[13px]">
        <label htmlFor="country" className="text-[11.5px] text-ink-3">Your country</label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-card-2 border border-line rounded-[10px] px-3 py-[7px] text-[13px] font-semibold"
        >
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <ul className="flex flex-col gap-2">
        {broker.entities.map((e) => {
          const reg = REGULATORS[e.licence.regulator];
          const you = e === match;
          /**
           * A compensation scheme belongs to the clients of the company that
           * holds the licence. An entity that takes no retail client has one,
           * and it is not the reader's — printing "FSCS up to £85,000" in green
           * beside Exness (UK) Ltd told a British reader they were covered by a
           * scheme they can never claim on. That was the worst line on this
           * site. It says what is true instead.
           */
          const retail = servesRetail(e);
          const protection = !retail
            ? 'Takes no retail clients — this licence is not yours'
            : reg?.compensation ?? 'No investor compensation scheme';
          return (
            <li
              key={e.legalName}
              className={
                you
                  ? 'border-[1.5px] border-warn bg-[#FFFBF1] rounded-[13px] p-[12px_13px]'
                  // De-emphasised by border and weight, never by opacity:
                  // fading text composites it towards the background and takes
                  // the contrast down with it, which is exactly what the
                  // unselected entities need least.
                  : 'border border-line bg-card-2 rounded-[13px] p-[12px_13px]'
              }
            >
              <div className="flex items-center gap-2">
                <Flag code={e.country} w={20} title={e.country} />
                <span className={`text-[13.5px] ${you ? 'font-bold' : 'font-semibold text-ink-2'}`}>
                  {e.legalName}
                </span>
                <div className="flex-1" />
                {you && (
                  <span className="text-[10.5px] font-extrabold text-white bg-warn px-[9px] py-[2px] rounded-md">
                    YOU
                  </span>
                )}
                {!retail && (
                  <span className="text-[10.5px] font-bold text-ink-3 border border-line rounded-md px-[7px] py-[2px]">
                    B2B
                  </span>
                )}
              </div>
              <p className={`text-[11.5px] mt-2 font-${you ? 'bold' : 'normal'} ${retail && reg?.compensation ? 'text-up' : 'text-warn'}`}>
                {protection}
              </p>
              <p className="text-[11.5px] text-ink-3 mt-[3px]">
                {reg?.name ?? e.licence.regulator} · licence {e.licence.number}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
