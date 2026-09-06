// Data-free half of the book model: types, age buckets, and pure formatting helpers.
//
// The Library grid is a client island, and importing anything from ./books pulls
// books.json into the browser bundle with it — the whole catalog, shipped a second
// time on top of the copy already serialized into the island's props. Client code
// imports from here instead; ./books re-exports all of it for server-side callers.

export interface Book {
  slug: string;
  title: string;
  coverImage: string | null;
  featured: boolean;
  author: string | null;
  illustrator: string | null;
  audience: string;
  audienceTags: string[];
  format: string;
  bookType: string;
  medicalTopics: string[];
  siblingFocus: boolean;
  faithBased: boolean | null;
  ageMin: number | null;
  ageMax: number | null;
  isbn: string | null;
  publicationYear: number | null;
  amazonProductUrl: string | null;
  affiliateUrl: string | null;
  publisherUrl: string | null;
  retailerName?: string | null;
  mlbSummary: string | null;
  verificationStatus: string;
  sourceUrl: string | null;
  notes: string | null;
  sourceCollections?: string[];
  hasSpanishEdition?: boolean;
  titleEs?: string | null;
  mlbSummaryEs?: string | null;
  amazonProductUrlEs?: string | null;
  coverImageEs?: string | null;
  isbnEs?: string | null;
}

export interface Topic {
  slug: string;
  label: string;
  icon: string;
  description: string;
  matchTopics: string[];
  matchBookTypes?: string[];
  labelEs?: string;
  descriptionEs?: string;
}

export interface AgeBucket {
  slug: string;
  label: string;
  labelEs?: string;
  min: number;
  max: number;
}

export const AGE_BUCKETS: AgeBucket[] = [
  { slug: '0-3', label: 'Ages 0 to 3', labelEs: 'Edades 0 a 3', min: 0, max: 3 },
  { slug: '4-8', label: 'Ages 4 to 8', labelEs: 'Edades 4 a 8', min: 4, max: 8 },
  { slug: '9-12', label: 'Ages 9 to 12', labelEs: 'Edades 9 a 12', min: 9, max: 12 },
  { slug: 'teens', label: 'Teens', labelEs: 'Adolescentes', min: 13, max: 18 },
];

export function localizeAgeBucket(bucket: AgeBucket, lang: 'en' | 'es'): AgeBucket {
  if (lang === 'en') return bucket;
  return { ...bucket, label: bucket.labelEs || bucket.label };
}

export function getAgeBucketForBook(book: Book): AgeBucket | null {
  if (book.ageMin == null && book.ageMax == null) return null;
  const min = book.ageMin ?? book.ageMax!;
  const max = book.ageMax ?? book.ageMin!;
  return AGE_BUCKETS.find((bucket) => min <= bucket.max && max >= bucket.min) ?? null;
}

export function formatAgeRange(book: Book, lang: 'en' | 'es' = 'en'): string {
  if (book.ageMin == null && book.ageMax == null) return '';
  if (lang === 'es') {
    if (book.ageMin != null && book.ageMax != null) {
      return book.ageMin === book.ageMax ? `Edad ${book.ageMin}` : `Edades ${book.ageMin}–${book.ageMax}`;
    }
    const known = book.ageMin ?? book.ageMax;
    return `Edades ${known}+`;
  }
  if (book.ageMin != null && book.ageMax != null) {
    return book.ageMin === book.ageMax ? `Age ${book.ageMin}` : `Ages ${book.ageMin}–${book.ageMax}`;
  }
  const known = book.ageMin ?? book.ageMax;
  return `Ages ${known}+`;
}
