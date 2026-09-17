import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getDb, inviteByToken, ROLE_LABEL } from '@commentfx/db';
import { DB_ENABLED } from '@/lib/db-available';
import { currentUser, ACCOUNTS_ENABLED } from '@/lib/session';
import { Card } from '@/components/primitives';
import { AcceptForm } from '../../AuthForms';

export const metadata: Metadata = { title: 'Your invitation', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  if (await currentUser()) redirect('/admin');
  const { token } = await params;

  let invite = null;
  if (DB_ENABLED && ACCOUNTS_ENABLED) {
    try {
      const { db } = await getDb();
      invite = await inviteByToken(db, token);
    } catch { /* below */ }
  }

  return (
    <main className="px-4 py-8 flex flex-col gap-[13px] max-w-[400px] mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">
        {invite ? `Welcome, ${invite.name}` : 'This invitation'}
      </h1>

      <Card className="p-4" as="section">
        {invite ? (
          <>
            <p className="text-[12.5px] text-ink-2 leading-[1.75] mb-3">
              {invite.invitedBy} invited you as <b>{invite.role}</b> — {ROLE_LABEL[invite.role].split('—')[1]?.trim()}.
              Choose a password and the account is yours.
            </p>
            <AcceptForm token={token} name={invite.email} />
          </>
        ) : (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            This link has expired, has already been used, or was never one of ours. Ask whoever sent
            it for another — an invitation lasts seven days and works once.{' '}
            <Link href="/admin/login" className="text-accent">Sign in</Link> if you already have an
            account.
          </p>
        )}
      </Card>
    </main>
  );
}
