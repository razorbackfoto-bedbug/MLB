import booksData from '../data/books.json';
import booksEsData from '../data/booksEs.json';
import tier1BooksData from '../data/tier1Books.json';
import tier1SickleBooksData from '../data/tier1SickleBooks.json';
import kidneyBooksData from '../data/kidneyBooks.json';
import topicsData from '../data/topics.json';
import type { Book, Topic, AgeBucket } from './bookTypes';
import { getAgeBucketForBook } from './bookTypes';

export type LocalizedBook = Book;

function amazonProductId(url?: string | null): string | null {
  if (!url) return null;
  const pathMatch = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  if (pathMatch) return pathMatch[1].toUpperCase();
  const queryMatch = url.match(/[?&](?:asin|ASIN)=([A-Z0-9]{10})(?:&|$)/i);
  return queryMatch ? queryMatch[1].toUpperCase() : null;
}

function spanishAmazonUrl(book: Book): string | null {
  return book.titleEs ? book.amazonProductUrlEs ?? null : book.amazonProductUrl ?? null;
}

export function localizeBook(book: Book, lang: 'en' | 'es'): LocalizedBook {
  if (lang === 'en' || !book.hasSpanishEdition) return book;
  const isTranslatedEnglishRecord = Boolean(book.titleEs);
  return {
    ...book,
    title: book.titleEs || book.title,
    mlbSummary: book.mlbSummaryEs ?? book.mlbSummary,
    coverImage: null,
    amazonProductUrl: spanishAmazonUrl(book),
    isbn: isTranslatedEnglishRecord ? book.isbnEs || null : book.isbn,
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
    sourceCollections: Array.from(new Set([...(existing.sourceCollections ?? []), ...(incoming.sourceCollections ?? [])])),
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

export const books: Book[] = dedupeBooks([
  ...(booksData as Book[]),
  ...(tier1BooksData as Book[]),
  ...(tier1SickleBooksData as Book[]),
  ...(kidneyBooksData as Book[]),
]);
export const booksEsOriginal: Book[] = dedupeBooks(booksEsData as Book[]);
export const topics: Topic[] = topicsData as Topic[];

export function isPublicReady(book: Book): boolean {
  const status = book.verificationStatus.toLowerCase();
  const verified = status.includes('ready') || status.includes('verified');
  return Boolean(
    verified &&
      book.title?.trim() &&
      book.author?.trim() &&
      book.audience?.trim() &&
      book.medicalTopics.length > 0 &&
      book.mlbSummary?.trim(),
  );
}

export function getAllBooks(): Book[] {
  return books.filter(isPublicReady);
}

export function getBookBySlug(slug: string): Book | undefined {
  return getAllBooks().find((book) => book.slug === slug);
}

export function getSpanishBooks(): Book[] {
  return dedupeBooks(
    [...books.filter((book) => book.hasSpanishEdition), ...booksEsOriginal],
    (book) => book.titleEs || book.title,
  ).filter((book) => {
    if (!isPublicReady(book) || !Boolean(book.titleEs || book.title)) return false;
    return Boolean(amazonProductId(spanishAmazonUrl(book)));
  });
}

export function getFeaturedBooks(limit = 4): Book[] {
  const publicBooks = getAllBooks();
  const candidates = [...publicBooks].sort((a, b) => Number(b.featured) - Number(a.featured));
  const selected: Book[] = [];
  const usedPrimaryTopics = new Set<string>();
  const usedTypes = new Set<string>();

  for (const book of candidates) {
    if (selected.length >= limit) break;
    const primaryTopic = book.medicalTopics[0] ?? '';
    if (usedPrimaryTopics.has(primaryTopic) && usedTypes.has(book.bookType)) continue;
    selected.push(book);
    if (primaryTopic) usedPrimaryTopics.add(primaryTopic);
    usedTypes.add(book.bookType);
  }

  if (selected.length < limit) {
    for (const book of candidates) {
      if (selected.length >= limit) break;
      if (!selected.some((selectedBook) => selectedBook.slug === book.slug)) selected.push(book);
    }
  }

  return selected;
}

export function getRelatedBooks(book: Book, limit = 4): Book[] {
  const ageMin = book.ageMin ?? book.ageMax;
  const ageMax = book.ageMax ?? book.ageMin;

  return getAllBooks()
    .filter((candidate) => candidate.slug !== book.slug)
    .map((candidate) => {
      const sharedTopics = candidate.medicalTopics.filter((topic) => book.medicalTopics.includes(topic));
      let score = sharedTopics.length * 10;
      if (book.medicalTopics[0] && candidate.medicalTopics[0] === book.medicalTopics[0]) score += 12;
      if (candidate.bookType === book.bookType) score += 3;
      score += candidate.audienceTags.filter((tag) => book.audienceTags.includes(tag)).length * 2;
      if (candidate.siblingFocus === book.siblingFocus) score += 1;

      const candidateMin = candidate.ageMin ?? candidate.ageMax;
      const candidateMax = candidate.ageMax ?? candidate.ageMin;
      if (ageMin != null && ageMax != null && candidateMin != null && candidateMax != null) {
        if (ageMin <= candidateMax && ageMax >= candidateMin) score += 3;
      }

      return { candidate, score, sharedTopics: sharedTopics.length };
    })
    .filter(({ sharedTopics }) => sharedTopics > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
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
  return getAllBooks().filter((book) => bookMatchesTopic(book, topic));
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

export function getUniqueMedicalTopics(): string[] {
  const set = new Set<string>();
  for (const book of getAllBooks()) for (const t of book.medicalTopics) set.add(t);
  return Array.from(set).sort();
}

export function getUniqueAudienceTags(): string[] {
  const set = new Set<string>();
  for (const book of getAllBooks()) for (const a of book.audienceTags) set.add(a);
  return Array.from(set).sort();
}

export function getUniqueBookTypes(): string[] {
  const set = new Set<string>();
  for (const book of getAllBooks()) set.add(book.bookType);
  return Array.from(set).sort();
}

export type { Book, Topic, AgeBucket } from './bookTypes';
export { AGE_BUCKETS, localizeAgeBucket, getAgeBucketForBook, formatAgeRange } from './bookTypes';
