'use client';

import { useEffect } from 'react';

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
 *   - It comes back when scrolling stops — but only on a page with nothing to
 *     take its place. A record page has a section bar that slides in behind it,
 *     so there the two simply swap on direction and stay where the reader left
 *     them; flipping back to the header on every pause would take away the one
 *     thing they are most likely to want while reading. Everywhere else there
 *     is no substitute, and a bar that returns when you stop is the forgiving
 *     choice: a reader who wants the nav does not have to know to scroll up.
 *   - The colour is decided on every frame, before the dead zone, because it
 *     depends on where the page is and not on which way it is going. The dead
 *     zone exists to stop the hiding flickering; applying it here would leave
 *     the bar the wrong colour after a small scroll.
 */
export function HeaderAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    const REVEAL_ABOVE = 120;
    const DEAD_ZONE = 6;
    const STOPPED_AFTER = 180;

    const header = document.querySelector<HTMLElement>('.site-header');
    // Every page opens on one of these. A page without one — the 404 — has
    // white under the bar from the first pixel, so the bar is white from the
    // first pixel too.
    const band = document.querySelector<HTMLElement>('.hero');
    // A page with one of these has something to show while the header is away,
    // so it does not need the header back the moment scrolling stops.
    const hasSubstitute = Boolean(document.querySelector('.section-bar'));

    let last = window.scrollY;
    let ticking = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const show = () => root.removeAttribute('data-chrome-hidden');

    const paint = () => {
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
      if (!hasSubstitute) {
        clearTimeout(stopTimer);
        stopTimer = setTimeout(show, STOPPED_AFTER);
      }
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
  }, []);

  return null;
}
