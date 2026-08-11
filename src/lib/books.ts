import booksData from '../data/books.json';
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
  mlbSummary: string | null;
  verificationStatus: string;
  sourceUrl: string | null;
  notes: string | null;
}

export interface Topic {
  slug: string;
  label: string;
  icon: string;
  description: string;
  matchTopics: string[];
  matchBookTypes?: string[];
}

export interface AgeBucket {
  slug: string;
  label: string;
  min: number;
  max: number;
}

export const AGE_BUCKETS: AgeBucket[] = [
  { slug: '0-3', label: 'Ages 0 to 3', min: 0, max: 3 },
  { slug: '4-8', label: 'Ages 4 to 8', min: 4, max: 8 },
  { slug: '9-12', label: 'Ages 9 to 12', min: 9, max: 12 },
  { slug: 'teens', label: 'Teens', min: 13, max: 18 },
];

export const books: Book[] = booksData as Book[];
export const topics: Topic[] = topicsData as Topic[];

export function getAllBooks(): Book[] {
  return books;
}

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
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

export function formatAgeRange(book: Book): string {
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
