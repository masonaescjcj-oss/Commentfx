'use client';

import { useEffect } from 'react';

/**
 * Hides the header while you scroll down and brings it back the moment you
 * stop or turn around.
 *
 * This is the first client component on the site, and it is deliberately the
 * smallest one that can exist: no state, no render, no markup. It sets one
 * attribute on <html> and the stylesheet does the rest. Everything else here
 * still ships zero JavaScript, and if this file never loads the header is
 * simply always visible — which is the behaviour it had before.
 *
 * Why it cannot be CSS. `animation-timeline: scroll()` can drive an animation
 * from scroll position, but the position is not what decides this: the same
 * offset hides the header going down and shows it going up. Direction is a
 * comparison between two frames, and CSS has nowhere to keep the first one.
 *
 * Three details that are the difference between this feeling right and feeling
 * broken:
 *
 *   - Nothing hides in the first 120px. A header that vanishes on the first
 *     flick of the wheel reads as a glitch rather than a behaviour.
 *   - A 6px dead zone, so the sub-pixel jitter a trackpad produces at rest
 *     cannot flip the direction back and forth.
 *   - It comes back when scrolling stops, not only when you scroll up. That is
 *     what the brief asked for and it is also the forgiving choice: a reader
 *     who wants the nav does not have to know they must scroll up to get it.
 */
export function HeaderAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    const REVEAL_ABOVE = 120;
    const DEAD_ZONE = 6;
    const STOPPED_AFTER = 180;

    let last = window.scrollY;
    let ticking = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const show = () => root.removeAttribute('data-chrome-hidden');

    const update = () => {
      ticking = false;
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

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(stopTimer);
      show();
    };
  }, []);

  return null;
}
