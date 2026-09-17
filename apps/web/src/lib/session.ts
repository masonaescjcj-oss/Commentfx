import 'server-only';
import { cookies, headers } from 'next/headers';
import { getDb, signedInBy, can, type Account, type Capability } from '@commentfx/db';
import { readSessionCookie, SESSION_COOKIE } from './cookie';
import { DB_ENABLED } from './db-available';

/**
 * Who is signed in, for a page or a server action.
 *
 * The middleware has already checked that the cookie's signature is ours, which
 * keeps unsigned traffic off these pages entirely. It has not checked, and
 * cannot, whether the session still exists, whether it has expired or whether
 * the account has been turned off since — those are database facts, and this is
 * where they are read. Every write path calls `requireCapability` rather than
 * trusting that the middleware let the request through: the middleware knows
 * only that somebody is signed in, never as whom.
 */
export async function currentUser(): Promise<Account | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !DB_ENABLED) return null;

  const jar = await cookies();
  const id = await readSessionCookie(jar.get(SESSION_COOKIE)?.value, secret);
  if (!id) return null;

  try {
    const { db } = await getDb();
    return (await signedInBy(db, id))?.user ?? null;
  } catch (err) {
    console.error('[session] lookup failed:', err);
    return null;
  }
}

/**
 * Whether the request came in on the break-glass token instead of an account.
 *
 * It is how the first admin is created on a fresh deployment and how somebody
 * gets back in when they have locked themselves out, and it is nobody: it has
 * no name to put in an audit row and no role to check. So it may reach the
 * admin, and every screen that writes says who you are not.
 */
export async function usingBreakGlass(): Promise<boolean> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const [jar, head] = await Promise.all([cookies(), headers()]);
  const provided = jar.get('cfx_admin')?.value
    ?? head.get('authorization')?.replace(/^Bearer\s+/i, '');
  return provided === token;
}

export interface Denied { ok: false; message: string }

/**
 * The gate every write goes through.
 *
 * It returns a message rather than throwing, because every caller here is a
 * server action whose job is to hand a sentence back to a form, and an
 * exception in that position becomes "something went wrong" on the screen.
 */
export async function requireCapability(
  capability: Capability,
): Promise<{ ok: true; user: Account } | Denied> {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false,
      message: 'Sign in first. The shared token gets you as far as this screen and no further — '
        + 'a change has to have a name on it.',
    };
  }
  if (!can(user.role, capability)) {
    return { ok: false, message: `Your account is a ${user.role}, which cannot do this.` };
  }
  return { ok: true, user };
}

export const ACCOUNTS_ENABLED = process.env.SESSION_SECRET !== undefined;
