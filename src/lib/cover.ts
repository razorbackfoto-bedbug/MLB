export const COVER_PALETTE = [
  { bg: '#215750', fg: '#FBF3E7' }, // teal
  { bg: '#E56F42', fg: '#FBF3E7' }, // coral
  { bg: '#F5C451', fg: '#22303A' }, // sunny
  { bg: '#7A9C4F', fg: '#FBF3E7' }, // sage
  { bg: '#1B4640', fg: '#FBF3E7' }, // deep teal
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

export function coverCandidatesFor(book: CoverBook): string[] {
  const candidates: string[] = [];
  const add = (url?: string | null) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  if (book.coverImage) {
    add(
      book.coverImage.includes('covers.openlibrary.org')
        ? `${book.coverImage}${book.coverImage.includes('?') ? '&' : '?'}default=false`
        : book.coverImage,
    );
  }

  const isbn = book.isbn?.toUpperCase().replace(/[^0-9X]/g, '');
  if (isbn && (isbn.length === 10 || isbn.length === 13)) {
    add(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  }

  const productId = book.amazonProductUrl?.match(/\/dp\/([^/?]+)/i)?.[1];
  if (productId) {
    add(`https://images-na.ssl-images-amazon.com/images/P/${productId}.01.LZZZZZZZ.jpg`);
  }

  return candidates;
}
