import { NextResponse, type NextRequest } from 'next/server';
import { readSessionCookie, SESSION_COOKIE } from '@/lib/cookie';

/**
 * The admin fails CLOSED. With neither SESSION_SECRET nor ADMIN_TOKEN
 * configured every /admin route is rewritten to a 404, so an accidental deploy
 * exposes nothing at all rather than an open editing surface.
 *
 * Two ways in, and they are not equals.
 *
 * A **session cookie** is an account: a name, a role, a session that can be
 * ended from another browser. The middleware checks only that the signature is
 * ours, which is enough to keep unsigned traffic off these pages and is all it
 * can check — whether the session still exists, whether it has expired and
 * whether the account is still enabled are database facts, read by the page.
 *
 * The **shared token** is break-glass. It is how the first admin is created on
 * a fresh deployment and how somebody gets back in after locking themselves
 * out. It has no name and no role, so it reaches the screens and writes
 * nothing: every action asks `requireCapability`, which asks who you are. A
 * deployment that has finished setting up can unset it and lose nothing.
 */
function sameSecret(a: string | undefined, b: string): boolean {
  if (a === undefined || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Reachable without being signed in, because they are how you sign in. */
const OPEN = ['/admin/login', '/admin/setup', '/admin/invite'];

export async function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const secret = process.env.SESSION_SECRET;
  if (!token && !secret) return NextResponse.rewrite(new URL('/not-found', req.url), { status: 404 });

  const path = req.nextUrl.pathname;

  if (secret) {
    const signedIn = await readSessionCookie(req.cookies.get(SESSION_COOKIE)?.value, secret);
    if (signedIn) return NextResponse.next();
    if (OPEN.some((p) => path === p || path.startsWith(`${p}/`))) return NextResponse.next();
  }

  const provided =
    req.cookies.get('cfx_admin')?.value ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (token && sameSecret(provided, token)) return NextResponse.next();

  // A browser gets a page it can act on; a script gets the status code it can
  // read. Sending a redirect to something holding a bearer token would turn a
  // clear 401 into a confusing 200 on a login page.
  if (secret && req.headers.get('accept')?.includes('text/html')) {
    const to = new URL('/admin/login', req.url);
    if (path !== '/admin') to.searchParams.set('next', path);
    return NextResponse.redirect(to);
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Bearer realm="CommentFX admin"' },
  });
}

export const config = { matcher: '/admin/:path*' };
