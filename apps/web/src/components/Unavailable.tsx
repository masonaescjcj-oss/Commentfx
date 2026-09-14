import { Card } from './primitives';

/**
 * Shown when a free upstream is rate-limited or down. Saying so plainly beats
 * an empty page or, worse, stale numbers presented as current.
 */
export function Unavailable({ what, reason }: { what: string; reason: string }) {
  return (
    <Card className="p-5 text-center">
      <p className="text-[14px] font-semibold mb-1">{what} is unavailable right now</p>
      <p className="text-[12.5px] text-ink-2 leading-[1.8] max-w-[42ch] mx-auto">
        The upstream data source did not answer ({reason}). This page refreshes
        automatically — nothing is cached as current that we could not confirm.
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
