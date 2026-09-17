import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestDb, schema } from './client.ts';
import {
  hashPassword, passwordMatches, passwordProblem,
  createFirstAdmin, accountCount, accountByEmail, listAccounts, setRole, setDisabled, changePassword,
  createSession, signedInBy, endSession, endAllSessions, pruneSessions,
  createInvite, inviteByToken, acceptInvite, revokeInvite, listInvites,
  can, CAPABILITIES,
} from './auth.ts';

const FIRST = { email: 'First@CommentFX.com', name: 'First Admin', password: 'a-long-enough-password' };

/* ── passwords ─────────────────────────────────────────────────────────── */

test('a password verifies against its own hash and nothing else', async () => {
  const hash = await hashPassword('a-long-enough-password');
  assert.ok(await passwordMatches('a-long-enough-password', hash));
  assert.ok(!await passwordMatches('a-long-enough-passwore', hash));
  assert.ok(!await passwordMatches('', hash));
});

test('two accounts with the same password do not have the same hash', async () => {
  const [a, b] = await Promise.all([hashPassword('the same password'), hashPassword('the same password')]);
  assert.notEqual(a, b, 'the salt is not doing its job');
  assert.ok(await passwordMatches('the same password', a));
  assert.ok(await passwordMatches('the same password', b));
});

/**
 * The cost lives in the stored value so it can be raised later without locking
 * out everybody who set a password before it was.
 */
test('the stored hash carries the parameters it was made with', async () => {
  const hash = await hashPassword('a-long-enough-password');
  const [n, r, p, salt, key] = hash.split(':');
  assert.equal(Number(n) > 1000, true);
  assert.ok(Number(r) > 0 && Number(p) > 0);
  assert.ok(salt && key);
});

test('an account with no password cannot be signed into', async () => {
  assert.ok(!await passwordMatches('anything at all', null));
  assert.ok(!await passwordMatches('', null));
});

test('a password has to be long, and length is the only rule', () => {
  assert.ok(passwordProblem('short'));
  assert.equal(passwordProblem('twelve chars'), null);
  assert.equal(passwordProblem('all lowercase letters no digits'), null, 'punctuation rules produce Password1!');
  assert.ok(passwordProblem('password1234'), 'the first thing anybody types');
});

/* ── the first account ─────────────────────────────────────────────────── */

test('the first admin can be created exactly once', async () => {
  const { db, close } = await makeTestDb();
  const first = await createFirstAdmin(db, FIRST);
  assert.equal(first?.role, 'admin');
  assert.equal(first?.email, 'first@commentfx.com', 'an address is not case-sensitive');

  const second = await createFirstAdmin(db, { ...FIRST, email: 'second@commentfx.com' });
  assert.equal(second, null, 'the door shuts after the first one');
  assert.equal(await accountCount(db), 1);
  await close();
});

test('an account is found by its address whatever case it is typed in', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  assert.ok(await accountByEmail(db, 'FIRST@commentfx.COM'));
  await close();
});

/* ── sessions ──────────────────────────────────────────────────────────── */

test('a session says who it belongs to until it is ended', async () => {
  const { db, close } = await makeTestDb();
  const user = (await createFirstAdmin(db, FIRST))!;
  const { id } = await createSession(db, user.id, 'a browser');

  assert.equal((await signedInBy(db, id))?.user.email, 'first@commentfx.com');
  await endSession(db, id);
  assert.equal(await signedInBy(db, id), null);
  await close();
});

test('a made-up session id is nobody', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  assert.equal(await signedInBy(db, 'not-a-real-session'), null);
  await close();
});

/**
 * The half that is easy to leave out. Setting the flag without dropping the
 * sessions is the difference between revoking access and asking for it back.
 */
test('disabling an account ends the sessions it already had', async () => {
  const { db, close } = await makeTestDb();
  const user = (await createFirstAdmin(db, FIRST))!;
  const { id } = await createSession(db, user.id);
  assert.ok(await signedInBy(db, id));

  await setDisabled(db, user.id, true, 'someone@else');
  assert.equal(await signedInBy(db, id), null);
  assert.equal((await db.select().from(schema.sessions)).length, 0);
  await close();
});

test('an expired session is nobody, and is cleaned up as it is read', async () => {
  const { db, close } = await makeTestDb();
  const user = (await createFirstAdmin(db, FIRST))!;
  await db.insert(schema.sessions).values({
    id: 'stale', userId: user.id, expiresAt: new Date(Date.now() - 1000),
  });
  assert.equal(await signedInBy(db, 'stale'), null);
  assert.equal((await db.select().from(schema.sessions)).length, 0);
  await close();
});

test('pruning removes what has expired and leaves what has not', async () => {
  const { db, close } = await makeTestDb();
  const user = (await createFirstAdmin(db, FIRST))!;
  await createSession(db, user.id);
  await db.insert(schema.sessions).values({
    id: 'stale', userId: user.id, expiresAt: new Date(Date.now() - 1000),
  });
  await pruneSessions(db);
  const left = await db.select().from(schema.sessions);
  assert.equal(left.length, 1);
  assert.notEqual(left[0]?.id, 'stale');
  await close();
});

test('changing a password does not by itself sign anybody out, and ending all does', async () => {
  const { db, close } = await makeTestDb();
  const user = (await createFirstAdmin(db, FIRST))!;
  const { id } = await createSession(db, user.id);

  await changePassword(db, user.id, 'a different long password');
  assert.ok(await signedInBy(db, id), 'the caller decides whether to sign out, not this function');

  await endAllSessions(db, user.id);
  assert.equal(await signedInBy(db, id), null);
  await close();
});

/* ── invitations ───────────────────────────────────────────────────────── */

test('an invitation makes an account, once', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  const made = await createInvite(db, {
    email: 'Writer@commentfx.com', name: 'A Writer', role: 'editor', invitedBy: 'first@commentfx.com',
  });
  assert.ok(made);

  const account = await acceptInvite(db, made.token, 'another long password');
  assert.equal(account?.email, 'writer@commentfx.com');
  assert.equal(account?.role, 'editor');
  assert.equal(account?.active, true);

  assert.equal(await acceptInvite(db, made.token, 'yet another password'), null, 'a used invitation is spent');
  await close();
});

/**
 * The token is returned once and stored only as a hash, so a database dump is
 * not a set of working invitations.
 */
test('the invitation token is not in the database', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  const made = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'editor', invitedBy: 'first@commentfx.com',
  }))!;
  const [row] = await db.select().from(schema.invites);
  assert.notEqual(row?.tokenHash, made.token);
  assert.ok(!JSON.stringify(row).includes(made.token));
  await close();
});

test('a made-up or expired invitation is not an invitation', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  assert.equal(await inviteByToken(db, 'invented'), null);

  const made = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'editor', invitedBy: 'first@commentfx.com',
  }))!;
  await db.update(schema.invites).set({ expiresAt: new Date(Date.now() - 1000) });
  assert.equal(await inviteByToken(db, made.token), null);
  assert.equal(await acceptInvite(db, made.token, 'a long enough password'), null);
  await close();
});

test('a second invitation to one address supersedes the first', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  const one = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'viewer', invitedBy: 'first@commentfx.com',
  }))!;
  const two = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'editor', invitedBy: 'first@commentfx.com',
  }))!;

  assert.equal(await inviteByToken(db, one.token), null, 'two working links for one person');
  assert.ok(await inviteByToken(db, two.token));
  assert.equal((await listInvites(db)).length, 1);
  await close();
});

test('somebody who already has an account cannot be invited again', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  assert.equal(await createInvite(db, {
    email: 'first@commentfx.com', name: 'First', role: 'admin', invitedBy: 'first@commentfx.com',
  }), null);
  await close();
});

test('a revoked invitation stops working', async () => {
  const { db, close } = await makeTestDb();
  await createFirstAdmin(db, FIRST);
  const made = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'editor', invitedBy: 'first@commentfx.com',
  }))!;
  assert.equal(await revokeInvite(db, made.invite.id, 'first@commentfx.com'), true);
  assert.equal(await inviteByToken(db, made.token), null);
  await close();
});

/* ── roles ─────────────────────────────────────────────────────────────── */

test('a role is a fact about the system, in one table', () => {
  assert.ok(can('admin', 'people'));
  assert.ok(!can('editor', 'people'), 'an editor does not decide who else gets in');
  assert.ok(can('editor', 'records') && can('editor', 'articles'));
  assert.ok(!can('moderator', 'records'), 'a moderator judges what readers said, not what the site says');
  assert.ok(can('moderator', 'reviews'));
  assert.deepEqual(CAPABILITIES.viewer, [], 'a viewer can look and change nothing');
});

test('every capability an admin has is named somewhere a role can be given it', () => {
  for (const cap of CAPABILITIES.admin) {
    assert.ok(
      Object.values(CAPABILITIES).some((list) => (list as readonly string[]).includes(cap)),
      `${cap} exists but no role has it`,
    );
  }
});

test('changing a role is recorded under the name of whoever changed it', async () => {
  const { db, close } = await makeTestDb();
  const admin = (await createFirstAdmin(db, FIRST))!;
  const made = (await createInvite(db, {
    email: 'w@commentfx.com', name: 'W', role: 'viewer', invitedBy: admin.email,
  }))!;
  const other = (await acceptInvite(db, made.token, 'a long enough password'))!;

  await setRole(db, other.id, 'editor', admin.email);
  const rows = await db.select().from(schema.auditLog);
  const change = rows.find((r) => r.action === 'change role');
  assert.equal(change?.actor, 'first@commentfx.com');
  assert.equal(change?.before, 'viewer');
  assert.equal(change?.after, 'editor');
  assert.ok(rows.every((r) => r.kind === null), 'an account is not an entity kind');
  await close();
});

test('an account is disabled rather than deleted, so the audit trail keeps meaning something', async () => {
  const { db, close } = await makeTestDb();
  const admin = (await createFirstAdmin(db, FIRST))!;
  await setDisabled(db, admin.id, true, 'someone@else');
  const [row] = await listAccounts(db);
  assert.ok(row?.disabledAt);
  assert.equal(row?.active, false);
  assert.equal(await accountCount(db), 1, 'still there');
  await close();
});
