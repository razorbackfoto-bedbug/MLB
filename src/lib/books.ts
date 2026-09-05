import booksData from '../data/books.json';
import booksEsData from '../data/booksEs.json';
import curatedAdditionsData from '../data/curatedAdditions.json';
import loeysDietzAdditionsData from '../data/loeysDietzAdditions.json';
import topicsData from '../data/topics.json';
import { coverOverrides } from '../data/coverOverrides';

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

function amazonCoverFor(book: Book): string | null {
  const match = book.amazonProductUrl?.match(/\/dp\/([^/?]+)/i);
  if (!match) return null;
  return `https://images-na.ssl-images-amazon.com/images/P/${match[1]}.01.LZZZZZZZ.jpg`;
}

function normalizeTitle(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeIsbn(isbn: string | null | undefined): string | null {
  if (!isbn) return null;
  const clean = isbn.toUpperCase().replace(/[^0-9X]/g, '');
  if (clean.length === 13) return clean;
  if (clean.length !== 10) return clean || null;

  const core = `978${clean.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${core}${check}`;
}

function bookQuality(book: Book): number {
  let score = 0;
  const status = book.verificationStatus.toLowerCase();
  if (status.includes('ready') || status.includes('verified')) score += 20;
  if (book.author) score += 3;
  if (book.illustrator) score += 1;
  if (book.coverImage) score += 3;
  if (book.isbn) score += 4;
  if (book.publicationYear) score += 2;
  if (book.mlbSummary) score += 5;
  if (book.amazonProductUrl) score += 2;
  if (book.publisherUrl) score += 2;
  return score;
}

function prefer<T>(primary: T | null | undefined, secondary: T | null | undefined): T | null {
  return primary ?? secondary ?? null;
}

function mergeDuplicateBooks(existing: Book, incoming: Book): Book {
  const incomingIsRicher = bookQuality(incoming) > bookQuality(existing);
  const primary = incomingIsRicher ? incoming : existing;
  const secondary = incomingIsRicher ? existing : incoming;

  return {
    ...secondary,
    ...primary,
    // Keep the first slug/title so existing internal URLs remain stable.
    slug: existing.slug,
    title: existing.title,
    coverImage: prefer(primary.coverImage, secondary.coverImage),
    featured: existing.featured || incoming.featured,
    author: prefer(primary.author, secondary.author),
    illustrator: prefer(primary.illustrator, secondary.illustrator),
    audienceTags: Array.from(new Set([...existing.audienceTags, ...incoming.audienceTags])),
    medicalTopics: Array.from(new Set([...existing.medicalTopics, ...incoming.medicalTopics])),
    siblingFocus: existing.siblingFocus || incoming.siblingFocus,
    faithBased: prefer(primary.faithBased, secondary.faithBased),
    ageMin: prefer(primary.ageMin, secondary.ageMin),
    ageMax: prefer(primary.ageMax, secondary.ageMax),
    isbn: prefer(primary.isbn, secondary.isbn),
    publicationYear: prefer(primary.publicationYear, secondary.publicationYear),
    amazonProductUrl: prefer(primary.amazonProductUrl, secondary.amazonProductUrl),
    affiliateUrl: prefer(primary.affiliateUrl, secondary.affiliateUrl),
    publisherUrl: prefer(primary.publisherUrl, secondary.publisherUrl),
    retailerName: prefer(primary.retailerName, secondary.retailerName),
    mlbSummary: prefer(primary.mlbSummary, secondary.mlbSummary),
    sourceUrl: prefer(primary.sourceUrl, secondary.sourceUrl),
    notes: prefer(primary.notes, secondary.notes),
    hasSpanishEdition: existing.hasSpanishEdition || incoming.hasSpanishEdition,
    titleEs: prefer(primary.titleEs, secondary.titleEs),
    mlbSummaryEs: prefer(primary.mlbSummaryEs, secondary.mlbSummaryEs),
    amazonProductUrlEs: prefer(primary.amazonProductUrlEs, secondary.amazonProductUrlEs),
    coverImageEs: prefer(primary.coverImageEs, secondary.coverImageEs),
    isbnEs: prefer(primary.isbnEs, secondary.isbnEs),
  };
}

function dedupeBooks(input: Book[], titleForBook: (book: Book) => string = (book) => book.title): Book[] {
  const output: Book[] = [];
  const slugIndex = new Map<string, number>();
  const titleIndex = new Map<string, number>();
  const isbnIndex = new Map<string, number>();

  for (const book of input) {
    const slugKey = book.slug.trim().toLowerCase();
    const titleKey = normalizeTitle(titleForBook(book));
    const isbnKey = normalizeIsbn(book.isbn);

    const existingIndex =
      slugIndex.get(slugKey) ??
      titleIndex.get(titleKey) ??
      (isbnKey ? isbnIndex.get(isbnKey) : undefined);

    if (existingIndex === undefined) {
      const index = output.length;
      output.push(book);
      slugIndex.set(slugKey, index);
      if (titleKey) titleIndex.set(titleKey, index);
      if (isbnKey) isbnIndex.set(isbnKey, index);
      continue;
    }

    const merged = mergeDuplicateBooks(output[existingIndex], book);
    output[existingIndex] = merged;

    // Point every known identity for either record back to the surviving entry.
    slugIndex.set(slugKey, existingIndex);
    slugIndex.set(merged.slug.trim().toLowerCase(), existingIndex);
    if (titleKey) titleIndex.set(titleKey, existingIndex);
    titleIndex.set(normalizeTitle(titleForBook(merged)), existingIndex);
    if (isbnKey) isbnIndex.set(isbnKey, existingIndex);
    const mergedIsbn = normalizeIsbn(merged.isbn);
    if (mergedIsbn) isbnIndex.set(mergedIsbn, existingIndex);
  }

  return output;
}

const loeysDietzSlugs = new Set((loeysDietzAdditionsData as Book[]).map((book) => book.slug));

const rawBooks = [
  ...(booksData as Book[]),
  ...(curatedAdditionsData as Book[]),
  ...(loeysDietzAdditionsData as Book[]),
];

const mergedBooks = dedupeBooks(rawBooks);

export const books: Book[] = mergedBooks.map((book) => ({
  ...book,
  coverImage:
    coverOverrides[book.slug] ??
    (loeysDietzSlugs.has(book.slug) ? amazonCoverFor(book) : null) ??
    book.coverImage,
}));

export const booksEsOriginal: Book[] = dedupeBooks(booksEsData as Book[]);
export const topics: Topic[] = topicsData as Topic[];

export function getAllBooks(): Book[] {
  return books;
}

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}

export function getSpanishBooks(): Book[] {
  return dedupeBooks(
    [...books.filter((book) => book.hasSpanishEdition), ...booksEsOriginal],
    (book) => book.titleEs || book.title,
  );
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
  return AGE_BUCKETS.find((bucket) => min <= bucket.max && max >= bucket.min) ?? null;
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
  for (const book of books) for (const t of book.medicalTopics) set.add(t);
  return Array.from(set).sort();
}

export function getUniqueAudienceTags(): string[] {
  const set = new Set<string>();
  for (const book of books) for (const a of book.audienceTags) set.add(a);
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
    if (filters.bookTypes?.length && !filters.bookTypes.includes(book.bookType)) return false;
    if (query) {
      const haystack = [book.title, book.author ?? '', book.illustrator ?? '', ...book.medicalTopics].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
