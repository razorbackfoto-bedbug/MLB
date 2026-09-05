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

let publicCountBefore = 0;
let canonicalized = 0;
let generatedCoversRemoved = 0;
const removedFromPublic = [];
const byPrimaryTopic = new Map();

for (const book of books) {
  if (!isPublicReady(book)) continue;
  publicCountBefore += 1;

  const productId = amazonProductId(book.amazonProductUrl);

  // Amazon is a hard publication requirement for Mighty Little Bookshelf.
  // A publisher/charity/direct-sale link may remain in the research catalog, but
  // the book is removed from the public site until a real Amazon product listing
  // has been confirmed and stored in amazonProductUrl.
  if (!productId) {
    book.verificationStatus = 'Hidden - no confirmed Amazon link';
    removedFromPublic.push(`${book.title} (${book.slug})`);
    continue;
  }

  book.amazonProductUrl = `https://www.amazon.com/dp/${productId}?tag=mightylittle-20`;
  canonicalized += 1;

  const primaryTopic = book.medicalTopics?.[0] ?? 'Uncategorized';
  byPrimaryTopic.set(primaryTopic, (byPrimaryTopic.get(primaryTopic) ?? 0) + 1);

  // Preserve exact Amazon /images/I/ artwork and verified retailer/publisher art.
  // Remove generated Amazon /images/P/ URLs because those can silently return a
  // blank image. The render-time cover fallback can still use the confirmed ASIN.
  if (isGeneratedAmazonCover(book.coverImage) && !isDirectAmazonCover(book.coverImage)) {
    book.coverImage = null;
    generatedCoversRemoved += 1;
  }
}

await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');

const publicCountAfter = publicCountBefore - removedFromPublic.length;
console.log(`Master catalog Amazon audit: ${publicCountBefore} previously public-ready books; ${publicCountAfter} remain public.`);
console.log(`Canonical Amazon links: ${canonicalized}; generated cover proxies removed: ${generatedCoversRemoved}.`);
console.log(`Public books by primary topic: ${Array.from(byPrimaryTopic.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([topic, count]) => `${topic}=${count}`).join(', ')}`);

if (removedFromPublic.length) {
  console.warn(`Removed from the live catalog for lacking a confirmed Amazon product link (${removedFromPublic.length}):\n- ${removedFromPublic.join('\n- ')}`);
}
