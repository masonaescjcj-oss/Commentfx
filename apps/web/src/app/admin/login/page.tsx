import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getDb, accountCount } from '@commentfx/db';
import { DB_ENABLED } from '@/lib/db-available';
import { currentUser, ACCOUNTS_ENABLED } from '@/lib/session';
import { Card, CardHead } from '@/components/primitives';
import { SignInForm } from '../AuthForms';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect('/admin');
  const { next } = await searchParams;

  // A fresh deployment has nobody to sign in as, so it is sent to make the
  // first account rather than shown a form it cannot use.
  let none = false;
  if (DB_ENABLED && ACCOUNTS_ENABLED) {
    try {
      const { db } = await getDb();
      none = (await accountCount(db)) === 0;
    } catch { /* the form says the rest */ }
  }
  if (none) redirect('/admin/setup');

  return (
    <main className="px-4 py-8 flex flex-col gap-[13px] max-w-[400px] mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">
        CommentFX admin
      </h1>

      <Card className="p-4" as="section">
        {ACCOUNTS_ENABLED ? (
          <SignInForm next={next ?? '/admin'} />
        ) : (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            This deployment has no <code className="text-[12px]">SESSION_SECRET</code>, so there are
            no accounts on it. It is reachable with the shared token and nothing can be written —
            every change here needs a name on it.
          </p>
        )}
      </Card>

      <Card className="p-4" as="section">
        <CardHead title="If you have been locked out" />
        <p className="text-[12px] text-ink-2 leading-[1.75]">
          Ask somebody with an admin account to invite you again — an invitation makes a new account
          and the old one can be turned off. If nobody has one, the shared{' '}
          <code className="text-[12px]">ADMIN_TOKEN</code> still reaches these pages, and{' '}
          <Link href="/admin/setup" className="text-accent">the setup page</Link> will create a first
          account if there is genuinely none.
        </p>
      </Card>
    </main>
  );
}
