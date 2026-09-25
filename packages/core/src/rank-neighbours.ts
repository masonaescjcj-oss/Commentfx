/**
 * The companies either side of this one in its ranking, closest first and then
 * back in rank order — the ones a reader is actually choosing between. Not the
 * top of the list: from #7, the useful comparison is #6 and #8, not #1.
 * `others` is the ranking without this company in it.
 */
export function nearestInRank<T>(others: Array<{ rank: number; item: T }>, rank: number, n = 3): Array<{ rank: number; item: T }> {
  return others
    .map((x, i) => ({ ...x, i }))
    .sort((a, b) => Math.abs(a.rank - rank) - Math.abs(b.rank - rank) || a.rank - b.rank || a.i - b.i)
    .slice(0, n)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map(({ rank: r, item }) => ({ rank: r, item }));
}
