'use client';

import Link from 'next/link';

/**
 * A render that threw. Distinct from not-found, which is a page we know we do
 * not have: this is a page we should have and could not build, so it says that
 * rather than implying the reader asked for something that does not exist.
 *
 * No site chrome, because the chrome is what may have thrown. Plain elements
 * and inline styles for the same reason — if the stylesheet is the problem,
 * everything here still renders.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" style={{ padding: '48px 20px', maxWidth: 520, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
        This page did not load
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#3E4656', marginTop: 12 }}>
        Something on our side failed while building it. Nothing you did caused this
        and nothing has been recorded. Try again — if it keeps happening the fault
        is ours and it is already logged.
      </p>
      {error.digest ? (
        <p style={{ fontSize: 12, color: '#616C84', marginTop: 12 }}>
          Reference <code>{error.digest}</code>
        </p>
      ) : null}
      <p style={{ marginTop: 24, display: 'flex', gap: 16, fontSize: 14 }}>
        <button
          onClick={reset}
          style={{ background: '#111827', color: '#fff', border: 0, borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
        <Link href="/" style={{ color: '#8F6522', alignSelf: 'center', fontWeight: 600 }}>
          Go to the front page
        </Link>
      </p>
    </main>
  );
}
