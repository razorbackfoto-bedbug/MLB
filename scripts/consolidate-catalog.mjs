import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const booksPath = path.join(dataDir, 'books.json');
const curatedPath = path.join(dataDir, 'curatedAdditions.json');
const loeysPath = path.join(dataDir, 'loeysDietzAdditions.json');
const overridesPath = path.join(dataDir, 'coverOverrides.ts');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

function normalizeTitle(title = '') {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’‘]/g, "'")
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeIsbn(value) {
  return value ? String(value).replace(/[^0-9X]/gi, '').toUpperCase() : null;
}

function isbn10To13(isbn10) {
  const cleaned = normalizeIsbn(isbn10);
  if (!cleaned || cleaned.length !== 10) return null;
  const body = `978${cleaned.slice(0, 9)}`;
  const sum = [...body].reduce((total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 1 : 3), 0);
  return `${body}${(10 - (sum % 10)) % 10}`;
}

function isbnKeys(value) {
  const cleaned = normalizeIsbn(value);
  if (!cleaned) return [];
  const keys = [cleaned];
  if (cleaned.length === 10) keys.push(isbn10To13(cleaned));
  return keys.filter(Boolean);
}

function completeness(book) {
  const preferred = [
    'coverImage', 'author', 'illustrator', 'isbn', 'publicationYear',
    'amazonProductUrl', 'publisherUrl', 'mlbSummary', 'sourceUrl', 'notes'
  ];
  let score = preferred.reduce((n, key) => n + (book[key] != null && book[key] !== '' ? 1 : 0), 0);
  if (/ready for website|verified/i.test(book.verificationStatus ?? '')) score += 8;
  return score;
}

function mergeArrays(a, b) {
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}

function mergeBooks(a, b) {
  const primary = completeness(b) > completeness(a) ? b : a;
  const secondary = primary === a ? b : a;
  const merged = { ...secondary, ...primary };
  merged.medicalTopics = mergeArrays(a.medicalTopics, b.medicalTopics);
  merged.audienceTags = mergeArrays(a.audienceTags, b.audienceTags);
  merged.sourceCollections = mergeArrays(a.sourceCollections, b.sourceCollections);
  merged.featured = Boolean(a.featured || b.featured);
  merged.siblingFocus = Boolean(a.siblingFocus || b.siblingFocus);
  if (merged.faithBased == null) merged.faithBased = a.faithBased ?? b.faithBased ?? null;
  return merged;
}

function parseCoverOverrides() {
  if (!exists(overridesPath)) return {};
  const text = fs.readFileSync(overridesPath, 'utf8');
  const out = {};
  for (const match of text.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) out[match[1]] = match[2];
  return out;
}

function collectionName(file, book) {
  if (file === 'curatedAdditions.json') return 'MLB curated additions';
  if (file === 'loeysDietzAdditions.json') return 'Loeys-Dietz Syndrome Foundation resources';
  const u = book.sourceUrl ?? '';
  if (u.includes('preemieadventures.com')) return 'Preemie Adventures catalog research';
  if (u.includes('chop.edu')) return "Children's Hospital of Philadelphia recommended books";
  return null;
}

const sourceFiles = [
  ['books.json', booksPath],
  ['curatedAdditions.json', curatedPath],
  ['loeysDietzAdditions.json', loeysPath],
].filter(([, p]) => exists(p));

const incoming = [];
for (const [file, p] of sourceFiles) {
  for (const original of readJson(p)) {
    const book = { ...original };
    const collection = collectionName(file, book);
    book.sourceCollections = mergeArrays(book.sourceCollections, collection ? [collection] : []);
    incoming.push(book);
  }
}

const bySlug = new Map();
const byTitle = new Map();
const byIsbn = new Map();
const result = [];

function findIndex(book) {
  if (book.slug && bySlug.has(book.slug)) return bySlug.get(book.slug);
  const title = normalizeTitle(book.title);
  if (title && byTitle.has(title)) return byTitle.get(title);
  for (const key of isbnKeys(book.isbn)) if (byIsbn.has(key)) return byIsbn.get(key);
  return -1;
}

function reindex(book, index) {
  if (book.slug) bySlug.set(book.slug, index);
  const title = normalizeTitle(book.title);
  if (title) byTitle.set(title, index);
  for (const key of isbnKeys(book.isbn)) byIsbn.set(key, index);
}

for (const book of incoming) {
  const index = findIndex(book);
  if (index === -1) {
    result.push(book);
    reindex(book, result.length - 1);
  } else {
    result[index] = mergeBooks(result[index], book);
    reindex(result[index], index);
  }
}

const overrides = parseCoverOverrides();
for (const book of result) {
  if (overrides[book.slug]) book.coverImage = overrides[book.slug];
}

result.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(booksPath, `${JSON.stringify(result, null, 2)}\n`);

for (const obsolete of [curatedPath, loeysPath, overridesPath]) {
  if (exists(obsolete)) fs.unlinkSync(obsolete);
}

console.log(`Consolidated ${incoming.length} source records into ${result.length} unique English catalog records.`);
