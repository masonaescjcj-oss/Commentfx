'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IMPACT_LABEL, releaseForTitle, type CalendarDay, type CalendarEvent, type Impact } from '@commentfx/core';

const DOT: Record<Impact, string> = {
  high: 'bg-down',
  medium: 'bg-warn',
  low: 'bg-line',
};

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  });

/**
 * Every event is in the HTML whatever the filter is set to, and the first
 * render shows UTC — the reader's timezone is only known once the page is
 * running, and a time that changes under a crawler or a reader with JS off is
 * worse than one honest fixed zone.
 */
export function CalendarList({ days, todayUtc }: { days: CalendarDay[]; todayUtc: string }) {
  const [highOnly, setHighOnly] = useState(false);
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    try {
      setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      /* A browser that will not name its zone keeps the UTC rendering. */
    }
  }, []);

  const shown = days
    .map((d) => ({ ...d, events: highOnly ? d.events.filter((e) => e.impact === 'high') : d.events }))
    .filter((d) => d.events.length > 0);

  const total = days.reduce((n, d) => n + d.events.length, 0);
  const high = days.reduce((n, d) => n + d.events.filter((e) => e.impact === 'high').length, 0);

  return (
    <>
      <div className="flex items-center gap-2 gutter">
        {([false, true] as const).map((only) => (
          <button
            key={String(only)}
            type="button"
            onClick={() => setHighOnly(only)}
            aria-pressed={highOnly === only}
            className={`text-[12px] px-[11px] py-[6px] rounded-[9px] border ${
              highOnly === only
                ? 'bg-ink text-white border-ink font-semibold'
                : 'bg-card-2 text-ink-2 border-line'
            }`}
          >
            {only ? `High impact (${high})` : `Everything (${total})`}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] text-ink-3">{zone ? `times in ${zone}` : 'times in UTC'}</span>
      </div>

      {shown.length === 0 ? (
        <p className="text-[13px] text-ink-3 gutter py-4">
          Nothing scheduled in this fortnight at that impact level.
        </p>
      ) : (
        shown.map((d) => (
          <section key={d.date} className="gutter">
            <h2 className="text-[12.5px] font-bold text-ink-2 pb-[7px] flex items-baseline gap-2">
              {dayLabel(d.date)}
              {d.date === todayUtc && (
                <span className="text-[10px] font-extrabold text-white bg-brass px-[7px] py-[1px] rounded">
                  TODAY
                </span>
              )}
            </h2>
            <ul className="bg-card border border-line rounded-[13px] overflow-hidden">
              {d.events.map((e) => (
                <li key={e.id} className="flex gap-[10px] p-[11px_12px] border-b border-line-2 last:border-b-0">
                  <span
                    aria-hidden
                    className={`w-[7px] h-[7px] rounded-full mt-[6px] shrink-0 ${DOT[e.impact]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <EventTitle event={e} />
                      <span className="text-[10.5px] font-bold text-ink-3 tnum">{e.currency}</span>
                    </div>
                    {e.detail && <p className="text-[11.5px] text-ink-3 mt-[3px] leading-[1.65]">{e.detail}</p>}
                    <p className="text-[11px] text-ink-3 mt-[4px]">
                      {IMPACT_LABEL[e.impact]} impact · {e.source}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <EventTime event={e} zone={zone} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

/** A release with a page of its own links to it; the rest are plain text. */
function EventTitle({ event }: { event: CalendarEvent }) {
  const release = releaseForTitle(event.title);
  if (!release) return <span className="text-[13px] font-semibold">{event.title}</span>;
  return (
    <Link href={`/calendar/${release.slug}`} className="text-[13px] font-semibold hover:text-brass">
      {event.title}
    </Link>
  );
}

function EventTime({ event, zone }: { event: CalendarEvent; zone: string | null }) {
  if (!event.at) {
    return <span className="text-[11px] text-ink-3 leading-[1.5] block max-w-[92px]">time not published</span>;
  }
  const at = new Date(event.at);
  const shown = zone
    ? at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: zone })
    : `${at.toISOString().slice(11, 16)} UTC`;

  return (
    <>
      <time dateTime={event.at} className="text-[13px] font-bold tnum block">{shown}</time>
      {event.localTime && <span className="text-[10.5px] text-ink-3 tnum">{event.localTime}</span>}
    </>
  );
}
