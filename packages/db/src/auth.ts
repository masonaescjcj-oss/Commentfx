import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { and, eq, isNull, lt, desc, sql } from 'drizzle-orm';
import type { AppDb } from './client.ts';
import { users, sessions, invites, auditLog, type userRole } from './schema.ts';

export type Role = (typeof userRole.enumValues)[number];

/**
 * Accounts, sessions and invitations.
 *
 * Deliberately built out of `node:crypto` and two tables rather than a library.
 * Not because the libraries are bad — because every one of them wants a mail
 * provider, an OAuth app or a hosted service, and this site is built to run on
 * free tiers with no account anywhere. What is actually needed here is small
 * enough to read in one sitting, and reading it is the only way anyone can
 * satisfy themselves that it is right.
 */

const scrypt = promisify(scryptCb) as (p: string | Buffer, s: Buffer, k: number) => Promise<Buffer>;

/**
 * scrypt with the parameters written into the stored value.
 *
 * Storing the cost alongside the hash is what lets the cost go up later without
 * locking out everybody who set a password before it did: an old hash still
 * verifies against its own parameters, and the next sign-in can quietly rewrite
 * it at the new ones. A scheme that hard-codes its cost has to choose between
 * never raising it and a forced reset for everyone.
 */
const N = 16384, R = 8, P = 1, KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN);
  return `${N}:${R}:${P}:${salt.toString('base64')}:${key.toString('base64')}`;
}

export async function passwordMatches(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split(':');
  if (parts.length !== 5) return false;
  const [, , , saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64!, 'base64');
  const expected = Buffer.from(keyB64!, 'base64');
  const actual = await scrypt(password, salt, expected.length);
  // Constant time, so a wrong password's failure point says nothing about how
  // much of it was right.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * What a password has to be before it is worth hashing.
 *
 * Length and nothing else, which is the current advice and also the honest one:
 * a rule demanding a digit and a symbol produces `Password1!` on every account
 * it touches. Twelve characters, and a check that it is not one of the handful
 * of things people type when a box asks for twelve characters.
 */
const OBVIOUS = new Set([
  'password1234', 'passwordpassword', '123456789012', 'qwertyuiop12',
  'letmein12345', 'administrator', 'commentfx123',
]);

export function passwordProblem(password: string): string | null {
  if (password.length < 12) return 'At least twelve characters. Length is what makes a password hard, not punctuation.';
  if (password.length > 200) return 'Under two hundred characters.';
  if (OBVIOUS.has(password.toLowerCase())) return 'That is one of the first things anybody would try.';
  return null;
}

/* ── users ─────────────────────────────────────────────────────────────── */

export interface Account {
  id: number;
  email: string;
  name: string;
  role: Role;
  disabledAt: Date | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  /** Whether they have ever accepted their invitation. */
  active: boolean;
}

const asAccount = (r: typeof users.$inferSelect): Account => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  disabledAt: r.disabledAt,
  lastSeenAt: r.lastSeenAt,
  createdAt: r.createdAt,
  active: r.passwordHash !== null && r.disabledAt === null,
});

export async function listAccounts(db: AppDb): Promise<Account[]> {
  const rows = await db.select().from(users).orderBy(users.email);
  return rows.map(asAccount);
}

export async function accountCount(db: AppDb): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  return row?.n ?? 0;
}

export async function accountByEmail(db: AppDb, email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return row ?? null;
}

/**
 * The first account, created from the break-glass token and only while there
 * are none. After that the door is shut and the only way in is an invitation
 * from somebody already here.
 */
export async function createFirstAdmin(
  db: AppDb,
  input: { email: string; name: string; password: string },
): Promise<Account | null> {
  if ((await accountCount(db)) > 0) return null;
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      name: input.name,
      role: 'admin',
      passwordHash: await hashPassword(input.password),
    })
    .returning();
  await db.insert(auditLog).values({
    actor: input.email.toLowerCase(), action: 'create account', kind: null,
    slug: input.email.toLowerCase(), field: 'role', after: 'admin',
  });
  return asAccount(row!);
}

export async function setRole(db: AppDb, id: number, role: Role, actor: string): Promise<Account | null> {
  const [before] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!before) return null;
  const [row] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
  await db.insert(auditLog).values({
    actor, action: 'change role', kind: null,
    slug: before.email, field: 'role', before: before.role, after: role,
  });
  return row ? asAccount(row) : null;
}

/**
 * Turn an account off, and end every session it has.
 *
 * Both halves matter. Setting the flag without dropping the sessions leaves
 * whoever was signed in signed in until their cookie expires, which is the
 * difference between revoking access and asking for it back.
 */
export async function setDisabled(db: AppDb, id: number, disabled: boolean, actor: string): Promise<Account | null> {
  const [before] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!before) return null;
  const [row] = await db
    .update(users)
    .set({ disabledAt: disabled ? new Date() : null })
    .where(eq(users.id, id))
    .returning();
  if (disabled) await db.delete(sessions).where(eq(sessions.userId, id));
  await db.insert(auditLog).values({
    actor, action: disabled ? 'disable account' : 'enable account', kind: null,
    slug: before.email, field: null, after: disabled ? 'disabled' : 'enabled',
  });
  return row ? asAccount(row) : null;
}

export async function changePassword(db: AppDb, id: number, password: string): Promise<void> {
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, id));
}

/* ── sessions ──────────────────────────────────────────────────────────── */

export const SESSION_DAYS = 14;

export interface SignedIn {
  session: { id: string; expiresAt: Date };
  user: Account;
}

export async function createSession(db: AppDb, userId: number, userAgent?: string) {
  const id = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ id, userId, expiresAt, userAgent: userAgent ?? null });
  return { id, expiresAt };
}

/**
 * Who a session id belongs to, if it is still anybody's.
 *
 * Four things have to be true and each is a way this could go wrong: the row
 * exists, it has not expired, the user exists, and the user is not disabled.
 * Checking only the first is the mistake that makes a disabled account keep
 * working until its cookie runs out.
 */
export async function signedInBy(db: AppDb, sessionId: string): Promise<SignedIn | null> {
  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row) return null;
  if (row.session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }
  if (row.user.disabledAt !== null) return null;
  return {
    session: { id: row.session.id, expiresAt: row.session.expiresAt },
    user: asAccount(row.user),
  };
}

export async function endSession(db: AppDb, sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function endAllSessions(db: AppDb, userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Housekeeping, run on sign-in: an expired row is of no use to anybody. */
export async function pruneSessions(db: AppDb): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export async function touchAccount(db: AppDb, id: number): Promise<void> {
  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, id));
}

/* ── invitations ───────────────────────────────────────────────────────── */

export const INVITE_DAYS = 7;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export interface Invitation {
  id: number;
  email: string;
  name: string;
  role: Role;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

/**
 * Create an invitation and return the one-time token with it.
 *
 * The token is returned here and stored nowhere in the clear, so the link can
 * be shown to the admin who made it and to nobody afterwards — not on a second
 * visit to the page, not to somebody reading the database. An admin who loses
 * the link issues another invitation, which is a smaller cost than a table full
 * of working credentials.
 */
export async function createInvite(
  db: AppDb,
  input: { email: string; name: string; role: Role; invitedBy: string },
): Promise<{ invite: Invitation; token: string } | null> {
  const email = input.email.toLowerCase();
  if (await accountByEmail(db, email)) return null;

  const token = randomBytes(24).toString('base64url');
  // One open invitation per address: a second one supersedes the first rather
  // than leaving two working links for one person.
  await db.delete(invites).where(and(eq(invites.email, email), isNull(invites.acceptedAt)));

  const [row] = await db
    .insert(invites)
    .values({
      email, name: input.name, role: input.role,
      tokenHash: hashToken(token),
      invitedBy: input.invitedBy,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
    })
    .returning();

  await db.insert(auditLog).values({
    actor: input.invitedBy, action: 'invite', kind: null,
    slug: email, field: 'role', after: input.role,
  });
  return { invite: row!, token };
}

export async function listInvites(db: AppDb): Promise<Invitation[]> {
  return db.select().from(invites).orderBy(desc(invites.createdAt));
}

export async function inviteByToken(db: AppDb, token: string): Promise<Invitation | null> {
  const [row] = await db.select().from(invites).where(eq(invites.tokenHash, hashToken(token))).limit(1);
  if (!row) return null;
  if (row.acceptedAt !== null) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  return row;
}

export async function revokeInvite(db: AppDb, id: number, actor: string): Promise<boolean> {
  const [row] = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  if (!row || row.acceptedAt !== null) return false;
  await db.delete(invites).where(eq(invites.id, id));
  await db.insert(auditLog).values({
    actor, action: 'revoke invite', kind: null, slug: row.email, field: null, after: null,
  });
  return true;
}

/** Accept an invitation: the account is created here and not before. */
export async function acceptInvite(
  db: AppDb,
  token: string,
  password: string,
): Promise<Account | null> {
  const invite = await inviteByToken(db, token);
  if (!invite) return null;
  if (await accountByEmail(db, invite.email)) return null;

  const [row] = await db
    .insert(users)
    .values({
      email: invite.email,
      name: invite.name,
      role: invite.role,
      passwordHash: await hashPassword(password),
    })
    .returning();

  await db.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, invite.id));
  await db.insert(auditLog).values({
    actor: invite.email, action: 'create account', kind: null,
    slug: invite.email, field: 'role', after: invite.role,
  });
  return asAccount(row!);
}

/* ── what each role may do ─────────────────────────────────────────────── */

/**
 * One table, so a permission is a fact about the system rather than a
 * recollection at each call site.
 *
 * Read it as: everything below your row is also yours. An editor changes what
 * the site says; a moderator judges what readers said and records what was
 * checked; an admin also decides who else gets in. Viewer is a real role and
 * not a placeholder — somebody who should see the verification queue and the
 * audit trail without being able to move anything is a sensible thing to be.
 */
export const CAPABILITIES = {
  admin: ['records', 'articles', 'reviews', 'verify', 'people'],
  editor: ['records', 'articles', 'verify'],
  moderator: ['reviews', 'verify'],
  viewer: [],
} as const satisfies Record<Role, readonly string[]>;

export type Capability = (typeof CAPABILITIES)['admin'][number];

export const can = (role: Role, capability: Capability): boolean =>
  (CAPABILITIES[role] as readonly string[]).includes(capability);

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin — everything, including who else gets in',
  editor: 'Editor — records, articles and verifications',
  moderator: 'Moderator — reviews and verifications',
  viewer: 'Viewer — can look, cannot change anything',
};
