/**
 * Search-result formatting limits.
 *
 * Google renders roughly 60 characters of a title and around 155-160 of a
 * description before truncating with an ellipsis. Going over does not hurt
 * ranking, but it does mean the reader sees a sentence cut mid-word, so both
 * helpers here trim on a word boundary and keep the meaningful part in view.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** Trims to `max` characters on a word boundary, adding an ellipsis when cut. */
export function truncateForMeta(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  // Reserve a character for the ellipsis, then step back to the last space.
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).replace(/[\s,;:.!?-]+$/, '');
  return `${cut}…`;
}

/**
 * Builds the <title>. The brand suffix is dropped rather than allowed to push a
 * title past the display limit — page titles here already lead with the book or
 * topic name, so a truncated "| Mighty Little Booksh…" only costs the reader the
 * end of the actual subject.
 */
export function buildPageTitle(title: string, siteName: string, max = TITLE_MAX): string {
  if (title === siteName) return title;
  const withBrand = `${title} | ${siteName}`;
  return withBrand.length <= max ? withBrand : title;
}
