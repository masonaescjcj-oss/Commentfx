import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getDb, accountCount } from '@commentfx/db';
import { DB_ENABLED } from '@/lib/db-available';
import { currentUser, usingBreakGlass, ACCOUNTS_ENABLED } from '@/lib/session';
import { Card, CardHead } from '@/components/primitives';
import { SetUpForm } from '../AuthForms';

export const metadata: Metadata = { title: 'First account', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  if (await currentUser()) redirect('/admin');

  let count = 0;
  if (DB_ENABLED) {
    try {
      const { db } = await getDb();
      count = await accountCount(db);
    } catch { /* below */ }
  }

  const allowed = ACCOUNTS_ENABLED && DB_ENABLED && count === 0 && await usingBreakGlass();

  return (
    <main className="px-4 py-8 flex flex-col gap-[13px] max-w-[440px] mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">
        The first account
      </h1>

      <Card className="p-4" as="section">
        {allowed ? (
          <>
            <p className="text-[12.5px] text-ink-2 leading-[1.75] mb-3">
              There are no accounts yet, and you are holding the shared token, so you can make the
              first one. It is an admin, and after it exists this page closes — everybody else
              arrives by invitation.
            </p>
            <SetUpForm />
          </>
        ) : count > 0 ? (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            There is already an account here, so this page is closed.{' '}
            <Link href="/admin/login" className="text-accent">Sign in</Link>, or ask somebody with
            an admin account to invite you.
          </p>
        ) : !ACCOUNTS_ENABLED ? (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            Set <code className="text-[12px]">SESSION_SECRET</code> on this deployment first. It is
            what signs the session cookie, and without it an account could be issued and never
            checked.
          </p>
        ) : !DB_ENABLED ? (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            This deployment has no database, so there is nowhere to keep an account.
          </p>
        ) : (
          <p className="text-[12.5px] text-ink-2 leading-[1.75]">
            The first account is made with the shared{' '}
            <code className="text-[12px]">ADMIN_TOKEN</code>, which this request is not carrying.
            That is the whole of the bootstrap: whoever can configure the deployment can create one
            account, and every account after it comes from somebody already here.
          </p>
        )}
      </Card>
    </main>
  );
}
