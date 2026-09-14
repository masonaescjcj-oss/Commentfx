import type { CalendarResult, CalendarSource } from './types.ts';
import { bls } from './bls.ts';
import { fomc } from './fomc.ts';
import { ecb } from './ecb.ts';

export * from './types.ts';
export { bls, parseBls } from './bls.ts';
export { fomc, parseFomc } from './fomc.ts';
export { ecb, parseEcb } from './ecb.ts';

export const CALENDAR_SOURCES: CalendarSource[] = [bls, fomc, ecb];

export async function fetchCalendars(): Promise<CalendarResult[]> {
  return Promise.all(CALENDAR_SOURCES.map((s) => s.fetch()));
}
