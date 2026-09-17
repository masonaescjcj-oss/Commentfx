'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  getDb, accountByEmail, accountCount, createFirstAdmin, acceptInvite, inviteByToken,
  passwordMatches, passwordProblem, createSession, endSession, endAllSessions, pruneSessions,
  touchAccount, createInvite, revokeInvite, setRole, setDisabled, changePassword,
  SESSION_DAYS, type Role,
} from '@commentfx/db';
import { signSessionCookie, readSessionCookie, SESSION_COOKIE } from '@/lib/cookie';
import { currentUser, requireCapability, usingBreakGlass } from '@/lib/session';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';

export interface AuthResult { ok: boolean; message: string; link?: string }

const ROLES: Role[] = ['admin', 'editor', 'moderator', 'viewer'];

/**
 * Signing in, and everything that follows from having accounts at all.
 *
 * Two rules run through the whole file. A failed sign-in says the same thing
 * whatever was wrong with it, because "no such account" and "wrong password"
 * told apart are a way to find out who has an account here. And nothing in it
 * works without SESSION_SECRET, which is also what the middleware reads — one
 * switch for the whole feature rather than a half-configured state where
 * sessions are issued and nothing checks them.
 */
const SAME_ANSWER = 'That is not an email address and password we have.';

function secret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

async function issue(userId: number, userAgent: string | null): Promise<void> {
  const { db } = await getDb();
  await pruneSessions(db);
  const session = await createSession(db, userId, userAgent ?? undefined);
  await touchAccount(db, userId);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSessionCookie(session.id, secret()!), {
    httpOnly: true,
    sameSite: 'lax',
    // Set on https only, which is every deployment of this. Leaving it off in
    // development is what lets the thing be tested at all on 127.0.0.1.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function signIn(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!secret()) return { ok: false, message: 'Accounts are not configured on this deployment.' };

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');

  if (!email || !password) return { ok: false, message: SAME_ANSWER };

  const { db } = await getDb();
  const account = await accountByEmail(db, email);
  // The hash is verified even when there is no such account, so the two cases
  // take the same time. Otherwise the response time is a directory of who works
  // here.
  const matched = await passwordMatches(password, account?.passwordHash ?? null);

  if (!account || !matched || account.disabledAt !== null) return { ok: false, message: SAME_ANSWER };

  await issue(account.id, form.get('ua') ? String(form.get('ua')) : null);
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const s = secret();
  const id = s ? await readSessionCookie(jar.get(SESSION_COOKIE)?.value, s) : null;
  if (id && DB_ENABLED) {
    const { db } = await getDb();
    await endSession(db, id);
  }
  jar.delete(SESSION_COOKIE);
  redirect('/admin/login');
}

/**
 * The first account on a fresh deployment.
 *
 * Two things have to be true and both are load-bearing: there are no accounts
 * yet, and the request is holding the break-glass token. The first without the
 * second is a hole — the middleware has to leave this page open to somebody
 * with no session, or the first account could never be made, so "there are no
 * accounts yet" on its own would let whoever found the URL first become the
 * admin of somebody else's site.
 *
 * It follows that a deployment with SESSION_SECRET, no ADMIN_TOKEN and no
 * accounts has no way in. That is the right answer rather than a gap: whoever
 * can set one environment variable can set the other, and the alternative is
 * an open door.
 */
export async function setUpFirstAdmin(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!secret()) return { ok: false, message: 'Set SESSION_SECRET before creating accounts.' };
  if (!await usingBreakGlass()) {
    return {
      ok: false,
      message: 'The first account is made with the shared ADMIN_TOKEN, which this request is not carrying.',
    };
  }

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const name = String(form.get('name') ?? '').trim();
  const password = String(form.get('password') ?? '');

  if (!email.includes('@')) return { ok: false, message: 'An email address.' };
  if (!name) return { ok: false, message: 'A name — it goes on everything you change.' };
  const weak = passwordProblem(password);
  if (weak) return { ok: false, message: weak };

  const { db } = await getDb();
  if ((await accountCount(db)) > 0) {
    return { ok: false, message: 'There is already an account here. Sign in, or have somebody invite you.' };
  }

  const account = await createFirstAdmin(db, { email, name, password });
  if (!account) return { ok: false, message: 'There is already an account here.' };

  await issue(account.id, null);
  redirect('/admin');
}

export async function acceptInvitation(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!secret()) return { ok: false, message: 'Accounts are not configured on this deployment.' };

  const token = String(form.get('token') ?? '');
  const password = String(form.get('password') ?? '');
  const again = String(form.get('again') ?? '');

  if (password !== again) return { ok: false, message: 'The two passwords are not the same.' };
  const weak = passwordProblem(password);
  if (weak) return { ok: false, message: weak };

  const { db } = await getDb();
  if (!(await inviteByToken(db, token))) {
    return { ok: false, message: 'That invitation has expired or has already been used. Ask for another.' };
  }

  const account = await acceptInvite(db, token, password);
  if (!account) return { ok: false, message: 'That invitation could not be accepted.' };

  await issue(account.id, null);
  redirect('/admin');
}

/* ── managing people ───────────────────────────────────────────────────── */

export async function invitePerson(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  const gate = await requireCapability('people');
  if (!gate.ok) return gate;

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const name = String(form.get('name') ?? '').trim();
  const role = String(form.get('role') ?? 'editor') as Role;

  if (!email.includes('@')) return { ok: false, message: 'An email address.' };
  if (!name) return { ok: false, message: 'A name — it goes on everything they change.' };
  if (!ROLES.includes(role)) return { ok: false, message: 'Unknown role.' };

  const { db } = await getDb();
  const made = await createInvite(db, { email, name, role, invitedBy: gate.user.email });
  if (!made) return { ok: false, message: 'That address already has an account here.' };

  revalidatePath('/admin/people');
  // Shown once and stored nowhere in the clear, so the page has to say that.
  return {
    ok: true,
    message: `Copy this link and send it to ${name}. It is shown once and works for seven days.`,
    link: `/admin/invite/${made.token}`,
  };
}

export async function changePerson(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  const gate = await requireCapability('people');
  if (!gate.ok) return gate;

  const id = Number(form.get('id'));
  const action = String(form.get('action') ?? '');
  if (!Number.isInteger(id)) return { ok: false, message: 'Unknown account.' };

  const { db } = await getDb();

  // The one rule that is not about permissions: you cannot take away your own
  // way back in. Somebody who demotes or disables themselves by accident has
  // locked the last admin out of their own site, and the break-glass token may
  // be long gone by then.
  if (id === gate.user.id && action !== 'sign-out-everywhere') {
    return { ok: false, message: 'Have somebody else change your own account. Locking yourself out is too easy.' };
  }

  if (action === 'sign-out-everywhere') {
    await endAllSessions(db, id);
    revalidatePath('/admin/people');
    return { ok: true, message: 'Signed out everywhere. You will need to sign in again.' };
  }

  if (action === 'role') {
    const role = String(form.get('role') ?? '') as Role;
    if (!ROLES.includes(role)) return { ok: false, message: 'Unknown role.' };
    await setRole(db, id, role, gate.user.email);
    revalidatePath('/admin/people');
    return { ok: true, message: `Now a ${role}.` };
  }

  if (action === 'disable' || action === 'enable') {
    await setDisabled(db, id, action === 'disable', gate.user.email);
    revalidatePath('/admin/people');
    return {
      ok: true,
      message: action === 'disable'
        ? 'Turned off, and every session it had is ended.'
        : 'Turned back on. They will need to sign in again.',
    };
  }

  if (action === 'revoke-invite') {
    await revokeInvite(db, id, gate.user.email);
    revalidatePath('/admin/people');
    return { ok: true, message: 'That link stops working now.' };
  }

  return { ok: false, message: 'Unknown action.' };
}

/** Changing your own password, which is the one account thing anybody may do. */
export async function changeOwnPassword(_prev: AuthResult | null, form: FormData): Promise<AuthResult> {
  const me = await currentUser();
  if (!me) return { ok: false, message: 'Sign in first.' };

  const current = String(form.get('current') ?? '');
  const next = String(form.get('next') ?? '');
  const again = String(form.get('again') ?? '');

  const { db } = await getDb();
  const row = await accountByEmail(db, me.email);
  if (!await passwordMatches(current, row?.passwordHash ?? null)) {
    return { ok: false, message: 'That is not your current password.' };
  }
  if (next !== again) return { ok: false, message: 'The two new passwords are not the same.' };
  const weak = passwordProblem(next);
  if (weak) return { ok: false, message: weak };

  await changePassword(db, me.id, next);
  // Every other browser is signed out; this one keeps its session, because
  // signing somebody out of the page they just used is how a password change
  // looks like a failure.
  const jar = await cookies();
  const keep = await readSessionCookie(jar.get(SESSION_COOKIE)?.value, secret()!);
  await endAllSessions(db, me.id);
  if (keep) await issue(me.id, null);

  return { ok: true, message: 'Changed. Every other browser has been signed out.' };
}
