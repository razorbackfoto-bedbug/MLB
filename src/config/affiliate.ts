/**
 * Central Amazon affiliate configuration.
 *
 * To go live with monetized links, set AMAZON_AFFILIATE_TAG below to the
 * Associates tracking ID (e.g. "mightylittle-20"). Every Amazon link on the
 * site is generated through getAmazonLink(), so changing this one constant
 * updates every book page and card at once. No other files need to change.
 */
export const AMAZON_AFFILIATE_TAG = '';

export interface AmazonLink {
  url: string;
  /** True once a tracking tag or explicit affiliate URL is applied. */
  isAffiliate: boolean;
  /** "View on Amazon" when a direct product page is known, otherwise "Search on Amazon". */
  label: string;
}

export function buildAmazonSearchUrl(title: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(title)}`;
}

function applyTag(rawUrl: string, tag: string): string {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set('tag', tag);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Resolves the best available Amazon link for a book.
 * Priority: explicit affiliateUrl from the catalog > product URL + tag > search URL + tag.
 */
export function getAmazonLink(book: {
  title: string;
  amazonProductUrl?: string | null;
  affiliateUrl?: string | null;
}): AmazonLink {
  const hasProductUrl = Boolean(book.amazonProductUrl);
  const baseUrl = book.amazonProductUrl || buildAmazonSearchUrl(book.title);
  const label = hasProductUrl ? 'View on Amazon' : 'Search on Amazon';

  if (book.affiliateUrl) {
    return { url: book.affiliateUrl, isAffiliate: true, label };
  }

  if (AMAZON_AFFILIATE_TAG) {
    return { url: applyTag(baseUrl, AMAZON_AFFILIATE_TAG), isAffiliate: true, label };
  }

  return { url: baseUrl, isAffiliate: false, label };
}
