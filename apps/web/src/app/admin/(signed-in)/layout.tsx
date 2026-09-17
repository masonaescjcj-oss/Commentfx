import { redirect } from 'next/navigation';
import { currentUser, usingBreakGlass } from '@/lib/session';

/**
 * The read gate, which the middleware cannot be.
 *
 * The middleware checks that a session cookie's signature is ours and stops
 * there — it runs on the edge and has no database, so it cannot know whether
 * the session still exists, whether it has expired, or whether the account was
 * turned off five minutes ago. Every *write* asks `requireCapability`, so none
 * of those could change anything. But without this they could still read: the
 * verification queue, every record, the audit trail of who did what, for as
 * long as the cookie lasted. Turning an account off has to mean turning it off.
 *
 * It is a layout rather than a line in each page because the failure mode of
 * the alternative is a new admin page that nobody remembers to guard. Sign-in,
 * setup and invitation live outside this group precisely because they are how
 * somebody with no session gets one.
 *
 * The break-glass token passes here and writes nothing, which is the whole of
 * what it is for: reaching the screens on a fresh deployment or after a
 * lock-out.
 */
export default async function SignedInLayout({ children }: { children: React.ReactNode }) {
  const [user, breakGlass] = await Promise.all([currentUser(), usingBreakGlass()]);
  if (!user && !breakGlass) redirect('/admin/login');
  return <>{children}</>;
}
