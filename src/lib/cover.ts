// Each pairing clears WCAG AA (4.5:1) for the title text drawn on the placeholder.
// Cream on the mid-tone coral and sage only reached 2.85, so those two are a touch
// lighter and take the dark ink foreground instead.
export const COVER_PALETTE = [
  { bg: '#215750', fg: '#FBF3E7' }, // teal      7.50:1
  { bg: '#E7784D', fg: '#22303A' }, // coral     4.63:1
  { bg: '#F5C451', fg: '#22303A' }, // sunny     8.31:1
  { bg: '#82A259', fg: '#22303A' }, // sage      4.68:1
  { bg: '#1B4640', fg: '#FBF3E7' }, // deep teal 9.55:1
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function coverPaletteFor(slug: string) {
  return COVER_PALETTE[hashString(slug) % COVER_PALETTE.length];
}

type CoverBook = {
  coverImage?: string | null;
  isbn?: string | null;
  amazonProductUrl?: string | null;
};

function amazonProductId(url?: string | null): string | null {
  if (!url) return null;

  const pathMatch = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  if (pathMatch) return pathMatch[1].toUpperCase();

  const queryMatch = url.match(/[?&](?:asin|ASIN)=([A-Z0-9]{10})(?:&|$)/i);
  return queryMatch ? queryMatch[1].toUpperCase() : null;
}

function isDirectAmazonImage(url?: string | null): boolean {
  return Boolean(url && /https:\/\/m\.media-amazon\.com\/images\/I\//i.test(url));
}

function isbn10From13(isbn13: string): string | null {
  if (!/^978\d{10}$/.test(isbn13)) return null;
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < core.length; i++) sum += Number(core[i]) * (10 - i);
  const remainder = 11 - (sum % 11);
  const check = remainder === 10 ? 'X' : remainder === 11 ? '0' : String(remainder);
  return `${core}${check}`;
}

function addAmazonCoverCandidates(add: (url?: string | null) => void, productId: string) {
  // Amazon book imagery is exposed through more than one host. Trying these in
  // sequence is more reliable than treating one generated URL as authoritative.
  add(`https://m.media-amazon.com/images/P/${productId}.01.LZZZZZZZ.jpg`);
  add(`https://images-na.ssl-images-amazon.com/images/P/${productId}.01.LZZZZZZZ.jpg`);
  add(`https://images.amazon.com/images/P/${productId}.01.LZZZZZZZ.jpg`);
}

export function coverCandidatesFor(book: CoverBook): string[] {
  const candidates: string[] = [];
  const add = (url?: string | null) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  // A real Amazon CDN /images/I/ URL is an exact product image, so keep it first.
  if (isDirectAmazonImage(book.coverImage)) add(book.coverImage);

  // When an Amazon product is known, try Amazon artwork before generic proxies.
  const productId = amazonProductId(book.amazonProductUrl);
  if (productId) addAmazonCoverCandidates(add, productId);

  // Preserve a verified non-Amazon source cover as the next fallback.
  if (book.coverImage && !isDirectAmazonImage(book.coverImage)) {
    add(
      book.coverImage.includes('covers.openlibrary.org')
        ? `${book.coverImage}${book.coverImage.includes('?') ? '&' : '?'}default=false`
        : book.coverImage,
    );
  }

  const isbn = book.isbn?.toUpperCase().replace(/[^0-9X]/g, '');
  if (isbn && (isbn.length === 10 || isbn.length === 13)) {
    // Some Amazon book listings use the ISBN-10 as the ASIN even when only an
    // ISBN-13 is stored in our catalog.
    const amazonIsbn = isbn.length === 10 ? isbn : isbn10From13(isbn);
    if (amazonIsbn && amazonIsbn !== productId) addAmazonCoverCandidates(add, amazonIsbn);

    // Last resort for older editions that have no usable Amazon image.
    add(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  }

  return candidates;
}
