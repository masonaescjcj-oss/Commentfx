import { avatarFor } from '@commentfx/core';

/**
 * A face for someone who has no account.
 *
 * There are no logins here, so nobody has a picture or a name to show. A
 * comment with nothing beside it reads as machine output; a made-up name would
 * read as a person, which would be a lie. So each review gets a two-letter tile
 * and a colour derived from its own id — stable for that review, meaningless
 * outside it, and obviously not a real name.
 *
 * The colour is picked in core, where a test walks all 360 hues it can produce
 * and fails if white stops clearing 4.5:1 on any of them. It exists because the
 * first version picked its lightness by eye and shipped a yellow tile at
 * 2.90:1, which axe caught on the one page that happened to have a review.
 */
export function Avatar({ id, size = 40 }: { id: number; size?: number }) {
  const { initials, colour } = avatarFor(id);
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-full shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, fontSize: size * 0.36, background: colour }}
    >
      {initials}
    </span>
  );
}
