import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { WithdrawForm } from '@/components/WithdrawForm';

const TITLE = 'Withdraw a review you wrote';
const DESC =
  'Take down a review you published, using the code you were given at the time. ' +
  'No account, no email — the code is the only thing that proves it was yours.';

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESC, path: '/reviews/withdraw' }),
  robots: { index: false, follow: true },
};

export default function WithdrawPage() {
  const trail = [{ name: 'Home', path: '/' }, { name: 'Withdraw a review', path: '/reviews/withdraw' }];

  return (
    <>
      <Header />
      <main id="main" className="shell pt-0 pb-6 lg:pt-3 lg:pb-10 flex flex-col gap-0 lg:gap-4">
        <Breadcrumbs trail={trail} />
        <header className="gutter">
          <h1 className="sr-only">Withdraw a review</h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] max-w-[48ch]">
            Paste the code you were shown when you published. It comes off the page
            immediately and stops counting towards anything.
          </p>
        </header>

        <Card className="p-4" as="section">
          <WithdrawForm />
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="If you have lost the code" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            We cannot give it back to you, and that is deliberate rather than unhelpful.
            There are no accounts here and no address is stored, so the code is the only
            thing that distinguishes you from someone else asking us to delete your review.
            If we kept a way to reconstruct it, so would anyone who reached the database.
          </p>
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mt-3">
            If a review breaks the law or names a private person, that is a different
            matter and does not need a code — it needs an editor, and we take those down
            on their merits.
          </p>
        </Card>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
