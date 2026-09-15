import { NextResponse, type NextRequest } from 'next/server';

/**
 * The admin fails CLOSED. With no ADMIN_TOKEN configured every /admin route is
 * rewritten to a 404, so an accidental deploy exposes nothing at all rather
 * than an open editing surface.
 *
 * This is a deliberate stopgap, not an auth system: a shared bearer token has
 * no per-user identity, no revocation and no session. It must be replaced with
 * real accounts before the admin is exposed to anyone but its author — which is
 * also why every write records an actor and lands in an append-only audit log.
 */
/**
 * Constant time, so the length and prefix of the real token cannot be read off
 * the response times. A shared bearer token is already the weakest part of this
 * admin; it should at least not leak itself.
 */
function sameSecret(a: string | undefined, b: string): boolean {
  if (a === undefined || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return NextResponse.rewrite(new URL('/not-found', req.url), { status: 404 });

  const provided =
    req.cookies.get('cfx_admin')?.value ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!sameSecret(provided, token)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer realm="CommentFX admin"' },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: '/admin/:path*' };
