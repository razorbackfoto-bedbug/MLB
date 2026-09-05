import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

function amazonProductId(url) {
  if (!url) return null;
  const path = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  if (path) return path[1].toUpperCase();
  const query = url.match(/[?&](?:asin|ASIN)=([A-Z0-9]{10})(?:&|$)/i);
  return query ? query[1].toUpperCase() : null;
}

function cleanIsbn(value) {
  if (!value) return null;
  const clean = String(value).toUpperCase().replace(/[^0-9X]/g, '');
  return clean.length === 10 || clean.length === 13 ? clean : null;
}

function isbn10From13(isbn13) {
  if (!/^978\d{10}$/.test(isbn13)) return null;
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(core[i]) * (10 - i);
  const mod = 11 - (sum % 11);
  const check = mod === 10 ? 'X' : mod === 11 ? '0' : String(mod);
  return `${core}${check}`;
}

function isPublicReady(book) {
  const status = String(book.verificationStatus ?? '').toLowerCase();
  const verified = status.includes('ready') || status.includes('verified');
  return Boolean(
    verified &&
      String(book.title ?? '').trim() &&
      String(book.author ?? '').trim() &&
      String(book.audience ?? '').trim() &&
      Array.isArray(book.medicalTopics) &&
      book.medicalTopics.length > 0 &&
      String(book.mlbSummary ?? '').trim(),
  );
}

function isDirectAmazonCover(url) {
  return typeof url === 'string' && /https:\/\/m\.media-amazon\.com\/images\/I\//i.test(url);
}

function isGeneratedAmazonCover(url) {
  return typeof url === 'string' && /https:\/\/(?:images\.amazon\.com|images-na\.ssl-images-amazon\.com|m\.media-amazon\.com)\/images\/P\//i.test(url);
}

let publicCount = 0;
let canonicalized = 0;
let isbnLinked = 0;
let generatedCoversRemoved = 0;
const unresolvedAmazon = [];
const unresolvedCover = [];
const byPrimaryTopic = new Map();

for (const book of books) {
  if (!isPublicReady(book)) continue;
  publicCount += 1;

  const primaryTopic = book.medicalTopics?.[0] ?? 'Uncategorized';
  byPrimaryTopic.set(primaryTopic, (byPrimaryTopic.get(primaryTopic) ?? 0) + 1);

  let productId = amazonProductId(book.amazonProductUrl);
  const isbn = cleanIsbn(book.isbn);

  // Most traditionally published books use their ISBN-10 as the Amazon ASIN.
  // Only derive this for 978 ISBN-13 values. 979 ISBNs and non-book ASINs must
  // already have an explicit Amazon product URL so we never invent a match.
  if (!productId && isbn) {
    const derived = isbn.length === 10 ? isbn : isbn10From13(isbn);
    if (derived) {
      productId = derived;
      isbnLinked += 1;
    }
  }

  if (productId) {
    book.amazonProductUrl = `https://www.amazon.com/dp/${productId}?tag=mightylittle-20`;
    canonicalized += 1;
  } else {
    unresolvedAmazon.push(`${book.title} (${book.slug})`);
  }

  // Preserve exact Amazon /images/I/ artwork and verified retailer/publisher art.
  // Remove only generated Amazon /images/P/ URLs, because those frequently return
  // blanks even though the URL itself looks valid. The render-time candidate chain
  // will try Amazon by ASIN/ISBN and then fall back to the stored source cover.
  if (isGeneratedAmazonCover(book.coverImage) && !isDirectAmazonCover(book.coverImage)) {
    book.coverImage = null;
    generatedCoversRemoved += 1;
  }

  if (!book.coverImage && !productId && !isbn) {
    unresolvedCover.push(`${book.title} (${book.slug})`);
  }
}

await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');

console.log(`Catalog Amazon/cover audit: ${publicCount} public-ready books.`);
console.log(`Canonical Amazon links: ${canonicalized}; ISBN-derived book links: ${isbnLinked}; generated cover proxies removed: ${generatedCoversRemoved}.`);
console.log(`Public-ready books by primary topic: ${Array.from(byPrimaryTopic.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([topic, count]) => `${topic}=${count}`).join(', ')}`);

if (unresolvedAmazon.length) {
  console.error(`Public-ready books lacking a confirmable Amazon product ID (${unresolvedAmazon.length}):\n- ${unresolvedAmazon.join('\n- ')}`);
}
if (unresolvedCover.length) {
  console.error(`Public-ready books lacking any usable cover source (${unresolvedCover.length}):\n- ${unresolvedCover.join('\n- ')}`);
}

if (unresolvedAmazon.length || unresolvedCover.length) {
  process.exitCode = 1;
}
