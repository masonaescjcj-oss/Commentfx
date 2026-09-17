/**
 * Signing the session cookie, with Web Crypto so the same code runs in the
 * middleware and on the server.
 *
 * The cookie carries a session id and a signature. The signature proves we
 * issued it, which is all the middleware needs to decide whether a request is
 * worth letting through at all; who it is and whether it still counts are read
 * from the database by the page, because a self-contained token cannot be
 * revoked and this has to be.
 *
 * There is no expiry inside the signature and that is deliberate: the row has
 * one, and putting a second copy in the cookie only creates a way for the two
 * to disagree.
 */

const encoder = new TextEncoder();

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
}

const toBase64Url = (bytes: ArrayBuffer): string => {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export async function signSessionCookie(sessionId: string, secret: string): Promise<string> {
  const mac = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(sessionId));
  return `${sessionId}.${toBase64Url(mac)}`;
}

/**
 * The session id inside a cookie, if the signature is ours.
 *
 * `crypto.subtle.verify` compares in constant time, so a forged cookie's
 * failure point says nothing about how close it was.
 */
export async function readSessionCookie(value: string | undefined, secret: string): Promise<string | null> {
  if (!value) return null;
  const at = value.lastIndexOf('.');
  if (at <= 0) return null;
  const id = value.slice(0, at);
  const mac = value.slice(at + 1);
  try {
    const ok = await crypto.subtle.verify(
      'HMAC', await key(secret), fromBase64Url(mac) as unknown as BufferSource, encoder.encode(id),
    );
    return ok ? id : null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'cfx_session';
