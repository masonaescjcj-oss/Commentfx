-- A review without a rating is a comment, and a comment is a thing people want
-- to leave. Requiring a number before anyone could say a sentence was a form
-- pretending to be a conversation: it asked for a score, a category and eighty
-- characters before the button would light up.
--
-- Nothing downstream needs it to be there. The score counts verified reviews
-- only, and summarise() now skips a null rating rather than reading it as zero
-- — which is the same rule the rest of this site already follows: missing is
-- excluded, never scored low.
ALTER TABLE reviews ALTER COLUMN rating DROP NOT NULL;
