import { ago, type NewsItem } from '@/lib/news';

/**
 * Headlines, each one the publisher's own words linking straight to their page.
 *
 * Nothing is rewritten and no story is hosted here. The masthead is above the
 * headline rather than below it, because who wrote a thing is most of what
 * tells you whether to read it — the layout in the screenshot puts it there for
 * the same reason.
 *
 * `rel="nofollow noopener external"` on every link, the same as every outbound
 * link on this site: we are not passing ranking to a page we do not edit, and
 * `noopener` is not optional on a target of `_blank`.
 */
export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((n) => (
        <li key={n.url} className="border-b border-line-2 last:border-b-0">
          <a
            href={n.url}
            rel="nofollow noopener external"
            target="_blank"
            className="flex items-start gap-3 py-[11px] group"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-[6px]">
                <span className="text-[11px] font-bold text-ink-3">{n.source}</span>
                {n.publishedAt ? (
                  <time dateTime={n.publishedAt} className="text-[11px] text-ink-3">
                    {ago(n.publishedAt)}
                  </time>
                ) : null}
              </span>
              <span className="block text-[13.5px] font-semibold leading-[1.4] mt-[3px] group-hover:text-brass">
                {n.title}
              </span>
            </span>
            {/* Sized in the attributes as well as the class, so the box is
                there before the picture is and nothing below it moves. A
                publisher that blocks hotlinking leaves an empty square of the
                right size rather than a collapsed row — which is why the
                headline, not the image, carries the meaning. */}
            {n.image ? (
              <img
                src={n.image}
                alt=""
                aria-hidden
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 shrink-0 rounded-[11px] object-cover bg-card-2 border border-line"
              />
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
