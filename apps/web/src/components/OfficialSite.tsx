/**
 * A link to the company's own site.
 *
 * Marked nofollow and labelled as theirs, not ours. A directory that links out
 * without saying whose page it is on the other end is doing the reader a
 * disservice, and one that passes ranking signal to companies it also ranks
 * has a conflict it cannot argue its way out of.
 */
export function OfficialSite({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      rel="nofollow noopener external"
      target="_blank"
      className="flex items-center gap-2 text-[12.5px] text-ink-2 py-[9px] group"
    >
      <span className="flex-1">
        {name}&rsquo;s own site <span className="text-ink-3">— their claims, not ours</span>
      </span>
      <span className="text-accent font-semibold group-hover:underline">
        {new URL(url).hostname.replace(/^www\./, '')} ↗
      </span>
    </a>
  );
}
