import { Card } from './primitives';

/**
 * Shown when a free upstream is rate-limited or down. Saying so plainly beats
 * an empty page or, worse, stale numbers presented as current.
 *
 * `elsewhere` sends the reader to the source itself. The calendar's own
 * source-down notice has always done that and it is the better manner: someone
 * who came for a number still wants the number, and the honest thing is to point
 * at whoever has it rather than to leave them at a dead end that is merely
 * well-worded.
 */
export function Unavailable(
  { what, reason, elsewhere }: {
    what: string;
    reason: string;
    elsewhere?: { href: string; label: string };
  },
) {
  return (
    <Card className="p-5 text-center">
      <p className="text-[14px] font-semibold mb-1">{what} is unavailable right now</p>
      <p className="text-[12.5px] text-ink-2 leading-[1.8] max-w-[42ch] mx-auto">
        The upstream data source did not answer ({reason}). This page refreshes
        automatically — nothing is cached as current that we could not confirm.
        {elsewhere ? (
          <>
            {' '}
            <a href={elsewhere.href} rel="nofollow noopener external" target="_blank" className="underline">
              {elsewhere.label}
            </a>
            .
          </>
        ) : null}
      </p>
    </Card>
  );
}

export function Freshness({ at, source }: { at: string; source: string }) {
  return (
    <p className="text-[11px] text-ink-3 px-1">
      Data from {source} · fetched{' '}
      <time dateTime={at}>{new Date(at).toUTCString().replace('GMT', 'UTC')}</time>
    </p>
  );
}
