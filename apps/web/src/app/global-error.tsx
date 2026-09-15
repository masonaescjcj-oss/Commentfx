'use client';

/**
 * The last resort: an error in the root layout itself, where error.tsx cannot
 * help because the layout that would hold it is the thing that failed. React
 * replaces the whole document, so this has to supply its own html and body.
 *
 * Everything here is inline and self-contained for the same reason the boundary
 * below it is: whatever broke may well be the stylesheet, the fonts, or the
 * chrome. Without this file a reader gets Next's own black-on-white default,
 * which is what this site had for every failure until now.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ margin: 0, background: '#F1F2F4', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ padding: '48px 20px', maxWidth: 520, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            CommentFX did not load
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#3E4656', marginTop: 12 }}>
            Something failed before the page could be built. This is our fault, not
            yours, and nothing you did has been recorded.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: '#616C84', marginTop: 12 }}>
              Reference <code>{error.digest}</code>
            </p>
          ) : null}
          <p style={{ marginTop: 24 }}>
            <button
              onClick={reset}
              style={{ background: '#111827', color: '#fff', border: 0, borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
