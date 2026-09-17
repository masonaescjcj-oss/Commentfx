import Link from 'next/link';
import type { Metadata } from 'next';
import { getDb, listAccounts, listInvites, ROLE_LABEL, CAPABILITIES } from '@commentfx/db';
import { currentUser, usingBreakGlass } from '@/lib/session';
import { Card, CardHead, Tag } from '@/components/primitives';
import { InviteForm, PersonControls, RevokeInvite, PasswordForm } from '../../AuthForms';

export const metadata: Metadata = { title: 'People', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const day = (d: Date) => d.toISOString().slice(0, 10);

export default async function PeoplePage() {
  const me = await currentUser();
  const breakGlass = await usingBreakGlass();

  if (!me) {
    return (
      <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
        <Link href="/admin" className="text-[12px] text-accent">‹ Admin</Link>
        <Card className="p-4" as="section">
          <CardHead title="Not signed in" />
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            {breakGlass
              ? 'You are here on the shared token, which is nobody: it has no name to put in an audit row and no role to check. Make an account and sign in.'
              : 'Sign in to manage people.'}{' '}
            <Link href="/admin/login" className="text-accent">Sign in</Link>
          </p>
        </Card>
      </main>
    );
  }

  const isAdmin = me.role === 'admin';
  const { db } = await getDb();
  const [accounts, invites] = await Promise.all([listAccounts(db), listInvites(db)]);
  const open = invites.filter((i) => i.acceptedAt === null && i.expiresAt.getTime() > Date.now());

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin" className="text-[12px] text-accent">‹ Admin</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em]">
          People
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          Signed in as <b>{me.name}</b> ({me.email}), {me.role}. Every change on this site is
          recorded against the account that made it, which is the whole reason accounts exist here:
          the shared token that came before recorded whatever name somebody typed into a box.
        </p>
      </header>

      {isAdmin && (
        <Card className="p-4" as="section">
          <CardHead title="Invite somebody" />
          <p className="text-[12px] text-ink-2 leading-[1.75] mb-3">
            There is no email here and there is not going to be one — this site runs on free tiers
            and unauthenticated APIs, and a mail provider is a dependency bought for one sentence.
            Make the link, copy it, send it however you already talk to them.
          </p>
          <InviteForm />
        </Card>
      )}

      <Card className="p-4" as="section">
        <CardHead title="Accounts" aside={<span className="text-[11.5px] text-ink-3 tnum">{accounts.length}</span>} />
        <ul>
          {accounts.map((a) => (
            <li key={a.id} className="py-[11px] border-b border-line-2 last:border-b-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[13.5px] font-semibold">{a.name}</span>
                <span className="text-[11.5px] text-ink-3">{a.email}</span>
                <div className="flex-1" />
                {a.disabledAt ? <Tag tone="bad">off</Tag> : !a.active ? <Tag tone="warn">not accepted</Tag> : null}
                <Tag tone={a.role === 'admin' ? 'good' : 'neutral'}>{a.role}</Tag>
              </div>
              <p className="text-[11px] text-ink-3 mt-[3px]">
                {ROLE_LABEL[a.role].split('—')[1]?.trim()}
                {a.lastSeenAt ? ` · last seen ${day(a.lastSeenAt)}` : ' · never signed in'}
              </p>
              {isAdmin && (
                <PersonControls id={a.id} role={a.role} disabled={a.disabledAt !== null} isSelf={a.id === me.id} />
              )}
            </li>
          ))}
        </ul>
      </Card>

      {isAdmin && open.length > 0 && (
        <Card className="p-4" as="section">
          <CardHead title="Invitations waiting" aside={<span className="text-[11.5px] text-ink-3 tnum">{open.length}</span>} />
          <ul>
            {open.map((i) => (
              <li key={i.id} className="py-[10px] border-b border-line-2 last:border-b-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold">{i.name}</span>
                  <span className="text-[11.5px] text-ink-3">{i.email}</span>
                  <Tag tone="neutral">{i.role}</Tag>
                  <div className="flex-1" />
                  <span className="text-[11px] text-ink-3 tnum">expires {day(i.expiresAt)}</span>
                </div>
                <p className="text-[11px] text-ink-3 mt-[3px]">
                  Invited by {i.invitedBy}. The link was shown once and is stored only as a hash — if
                  it is lost, make another.
                </p>
                <div className="mt-2"><RevokeInvite id={i.id} /></div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4" as="section">
        <CardHead title="Your password" />
        <PasswordForm />
      </Card>

      <Card className="p-4" as="section">
        <CardHead title="What each role may do" />
        <ul className="text-[12px] leading-[1.8]">
          {(Object.keys(CAPABILITIES) as Array<keyof typeof CAPABILITIES>).map((role) => (
            <li key={role} className="py-[6px] border-b border-line-2 last:border-b-0">
              <b>{role}</b>
              <span className="text-ink-3">
                {' — '}
                {CAPABILITIES[role].length === 0 ? 'nothing; can look at every screen here' : CAPABILITIES[role].join(', ')}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
          Read from one table in the code, not written out here — a permission is a fact about the
          system rather than a recollection at each call site.
        </p>
      </Card>
    </main>
  );
}
