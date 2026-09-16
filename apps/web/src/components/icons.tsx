/**
 * The line icons for the quick-jump grid.
 *
 * Drawn rather than installed: eight of them at twenty-two pixels is less code
 * than the import statement for an icon library, and it keeps the site's one
 * dependency-free rule intact. They share one stroke weight and one cap style
 * so the grid reads as a set rather than as eight pictures.
 */
const S = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    {children}
  </svg>
);

export const IconScore = () => <S><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></S>;
export const IconEntity = () => <S><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" /></S>;
export const IconLicence = () => <S><path d="M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6l7-3z" /><path d="m9 12 2 2 4-4" /></S>;
export const IconCost = () => <S><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19M6 14.5h3" /></S>;
export const IconStatus = () => <S><path d="M2 12a10 10 0 0 1 20 0" /><path d="M6 14a6 6 0 0 1 12 0" /><circle cx="12" cy="18" r="1.4" /></S>;
export const IconReviews = () => <S><path d="M4 5h16v10H9l-5 4V5z" /><path d="M8 9h8M8 12h5" /></S>;
export const IconCompare = () => <S><path d="M8 4 4 8l4 4M4 8h16M16 20l4-4-4-4M20 16H4" /></S>;
export const IconFaq = () => <S><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.6 2.6 0 1 1 3.3 2.5c-.6.2-.8.7-.8 1.3v.4" /><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" /></S>;
export const IconReview = () => <S><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9.5 12h6M9.5 15.5h4" /></S>;
// A magnifier over a page: the section where a person went and looked, as
// against the one the record wrote itself.
export const IconResearch = () => <S><path d="M6 3h8l4 4v5.5" /><path d="M14 3v4h4" /><path d="M6 3v18h5" /><circle cx="16.5" cy="17" r="3.5" /><path d="m19.2 19.6 2.3 2.3" /></S>;
