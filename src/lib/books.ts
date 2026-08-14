import booksData from '../data/books.json';
import booksEsData from '../data/booksEs.json';
import topicsData from '../data/topics.json';

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
  /** Display name for publisherUrl when it's the primary purchase link (e.g. "Kids With Heart"). */
  retailerName?: string | null;
  mlbSummary: string | null;
  verificationStatus: string;
  sourceUrl: string | null;
  notes: string | null;
  /** True only once a real, verified Spanish-language edition has been confirmed purchasable. */
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

/** Locale-agnostic view of a Book: title/summary/cover/link swapped to Spanish where available. */
export type LocalizedBook = Book;

export function localizeBook(book: Book, lang: 'en' | 'es'): LocalizedBook {
  if (lang === 'en' || !book.hasSpanishEdition) return book;
  return {
    ...book,
    title: book.titleEs || book.title,
    mlbSummary: book.mlbSummaryEs ?? book.mlbSummary,
    coverImage: book.coverImageEs || book.coverImage,
    amazonProductUrl: book.amazonProductUrlEs || book.amazonProductUrl,
    isbn: book.isbnEs || book.isbn,
  };
}

export function localizeTopic(topic: Topic, lang: 'en' | 'es'): Topic {
  if (lang === 'en') return topic;
  return {
    ...topic,
    label: topic.labelEs || topic.label,
    description: topic.descriptionEs || topic.description,
  };
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

export const books: Book[] = booksData as Book[];
export const booksEsOriginal: Book[] = booksEsData as Book[];
export const topics: Topic[] = topicsData as Topic[];

export function getAllBooks(): Book[] {
  return books;
}

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}

export function getSpanishBooks(): Book[] {
  return [...books.filter((book) => book.hasSpanishEdition), ...booksEsOriginal];
}

export function getFeaturedBooks(limit = 4): Book[] {
  const featured = books.filter((book) => book.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = books.filter((book) => !book.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getAllTopics(): Topic[] {
  return topics;
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

export function bookMatchesTopic(book: Book, topic: Topic): boolean {
  const topicMatch = book.medicalTopics.some((t) => topic.matchTopics.includes(t));
  const typeMatch = topic.matchBookTypes?.includes(book.bookType) ?? false;
  return topicMatch || typeMatch;
}

export function getBooksForTopic(topicSlug: string): Book[] {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return [];
  return books.filter((book) => bookMatchesTopic(book, topic));
}

export function getAgeBucketForBook(book: Book): AgeBucket | null {
  if (book.ageMin == null && book.ageMax == null) return null;
  const min = book.ageMin ?? book.ageMax!;
  const max = book.ageMax ?? book.ageMin!;
  return (
    AGE_BUCKETS.find((bucket) => min <= bucket.max && max >= bucket.min) ?? null
  );
}

export function formatAgeRange(book: Book, lang: 'en' | 'es' = 'en'): string {
  if (lang === 'es') {
    if (book.ageMin == null && book.ageMax == null) return 'Edades aún no listadas';
    if (book.ageMin != null && book.ageMax != null) {
      return book.ageMin === book.ageMax ? `Edad ${book.ageMin}` : `Edades ${book.ageMin}–${book.ageMax}`;
    }
    const known = book.ageMin ?? book.ageMax;
    return `Edades ${known}+`;
  }
  if (book.ageMin == null && book.ageMax == null) return 'Ages not yet listed';
  if (book.ageMin != null && book.ageMax != null) {
    return book.ageMin === book.ageMax ? `Age ${book.ageMin}` : `Ages ${book.ageMin}–${book.ageMax}`;
  }
  const known = book.ageMin ?? book.ageMax;
  return `Ages ${known}+`;
}

export function getUniqueMedicalTopics(): string[] {
  const set = new Set<string>();
  for (const book of books) {
    for (const t of book.medicalTopics) set.add(t);
  }
  return Array.from(set).sort();
}

export function getUniqueAudienceTags(): string[] {
  const set = new Set<string>();
  for (const book of books) {
    for (const a of book.audienceTags) set.add(a);
  }
  return Array.from(set).sort();
}

export function getUniqueBookTypes(): string[] {
  const set = new Set<string>();
  for (const book of books) set.add(book.bookType);
  return Array.from(set).sort();
}

export interface LibraryFilters {
  ageBuckets?: string[];
  topics?: string[];
  audience?: string[];
  bookTypes?: string[];
  query?: string;
}

export function filterBooks(all: Book[], filters: LibraryFilters): Book[] {
  const query = filters.query?.trim().toLowerCase();

  return all.filter((book) => {
    if (filters.ageBuckets?.length) {
      const bucket = getAgeBucketForBook(book);
      if (!bucket || !filters.ageBuckets.includes(bucket.slug)) return false;
    }
    if (filters.topics?.length) {
      const hasTopic = book.medicalTopics.some((t) => filters.topics!.includes(t));
      if (!hasTopic) return false;
    }
    if (filters.audience?.length) {
      const hasAudience = book.audienceTags.some((a) => filters.audience!.includes(a));
      if (!hasAudience) return false;
    }
    if (filters.bookTypes?.length) {
      if (!filters.bookTypes.includes(book.bookType)) return false;
    }
    if (query) {
      const haystack = [
        book.title,
        book.author ?? '',
        book.illustrator ?? '',
        ...book.medicalTopics,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
