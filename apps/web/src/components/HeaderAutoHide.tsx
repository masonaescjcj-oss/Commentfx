'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The two things the header does that it cannot do on its own.
 *
 * It hides while you scroll down and comes back the moment you stop or turn
 * around; and it is blue while it is standing on the blue band at the top of
 * the page, and white once that band has gone past.
 *
 * This is still the only client component on the site, and it is still the
 * smallest one that can exist: no state, no render, no markup. It sets two
 * attributes on <html> and the stylesheet does the rest. Everything else here
 * ships zero JavaScript, and if this file never loads the header is simply
 * always visible and always blue — which is the behaviour it had before.
 *
 * Why neither can be CSS. `animation-timeline: scroll()` drives an animation
 * from scroll position, and position is not what decides either of these. The
 * same offset hides the header going down and shows it going up: direction is
 * a comparison between two frames, and CSS has nowhere to keep the first one.
 * And the white switch is a comparison between two elements — where the band
 * ends against where the bar is — which CSS has no way to ask about at all.
 *
 * Four details that are the difference between this feeling right and feeling
 * broken:
 *
 *   - Nothing hides in the first 120px. A header that vanishes on the first
 *     flick of the wheel reads as a glitch rather than a behaviour.
 *   - A 6px dead zone, so the sub-pixel jitter a trackpad produces at rest
 *     cannot flip the direction back and forth.
 *   - It comes back when scrolling stops, not only when you scroll up. That is
 *     the forgiving choice: a reader who wants the nav does not have to know
 *     they must scroll up to get it.
 *   - The colour is decided on every frame, before the dead zone, because it
 *     depends on where the page is and not on which way it is going. The dead
 *     zone exists to stop the hiding flickering; applying it here would leave
 *     the bar the wrong colour after a small scroll.
 */
export function HeaderAutoHide() {
  // Re-run on every navigation. The listeners are cheap to re-attach, `last`
  // wants resetting against the new page's scroll position anyway, and it
  // repaints for a reader who navigates without scrolling afterwards — where
  // nothing else would call paint at all.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const REVEAL_ABOVE = 120;
    const DEAD_ZONE = 6;
    const STOPPED_AFTER = 180;

    let last = window.scrollY;
    let ticking = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const show = () => root.removeAttribute('data-chrome-hidden');

    /**
     * Both elements are looked up here, on every paint, rather than captured
     * once when the effect runs.
     *
     * Capturing them was a bug with a long fuse. A client-side navigation
     * replaces the band — the old node is detached from the document, and a
     * detached element's getBoundingClientRect() is all zeros. Zero is less
     * than the header's height, so the captured reference reported "the band
     * has gone past" from then on, for ever. The bar went white on the first
     * scroll of every page after the first one and never came back, and a
     * reload fixed it, which is why it read as intermittent.
     *
     * Every page opens on one of these bands. A page without one — the 404 —
     * has white under the bar from the first pixel, so the bar is white from
     * the first pixel too.
     *
     * A querySelector on a single class, at most once a frame, is not worth
     * saving.
     */
    const paint = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      const band = document.querySelector<HTMLElement>('.hero');
      const past = !band || !header || band.getBoundingClientRect().bottom <= header.offsetHeight;
      root.toggleAttribute('data-chrome-light', past);
    };

    const update = () => {
      ticking = false;
      paint();

      const y = window.scrollY;
      const delta = y - last;

      if (Math.abs(delta) < DEAD_ZONE) return;
      last = y;

      if (y < REVEAL_ABOVE || delta < 0) show();
      else root.setAttribute('data-chrome-hidden', '');
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(show, STOPPED_AFTER);
    };

    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    // A band's height depends on the width — a heading that wrapped onto two
    // lines on a phone is one line on a desktop — so where it ends moves when
    // the window does, without a pixel of scrolling.
    window.addEventListener('resize', paint, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', paint);
      clearTimeout(stopTimer);
      show();
      root.removeAttribute('data-chrome-light');
    };
  }, [pathname]);

  return null;
}
