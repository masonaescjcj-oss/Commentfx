/**
 * Every upstream here is a free, unauthenticated, rate-limited API. Two rules
 * follow from that and they are enforced in this one file:
 *
 *   1. A failure NEVER throws. It returns null, the caller renders an honest
 *      "unavailable" state, and the page still builds. A free tier going quiet
 *      must not be able to take the site down.
 *   2. Everything is cached at the edge for as long as the data is actually
 *      useful, so one build or one revalidation costs one upstream call —
 *      not one per page.
 */

export interface FetchOptions {
  /** Seconds Next should serve the cached response before refetching. */
  revalidate: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export type Fetched<T> = { ok: true; data: T; at: string } | { ok: false; reason: string };

export async function safeJson<T>(url: string, opts: FetchOptions): Promise<Fetched<T>> {
  const { revalidate, timeoutMs = 8000, headers } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'CommentFX/0.1 (+https://commentfx.com)', ...headers },
      next: { revalidate },
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true, data: (await res.json()) as T, at: new Date().toISOString() };
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'network error';
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a value that an upstream may send as a string, a number, or not at all. */
export function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** GoPlus encodes booleans as the strings "0" and "1". */
export const flag = (v: unknown): boolean | null =>
  v === '1' || v === 1 ? true : v === '0' || v === 0 ? false : null;
