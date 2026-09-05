import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

// Exact Amazon matches verified for NICU records added during the recent expansion.
// Only set coverImage when we have a real direct Amazon CDN image. Do not replace
// a working publisher/Open Library cover with a guessed Amazon image URL.
const verifiedAmazon = {
  'waiting-for-max': { asin: '1685552803' },
  'waiting-for-baby-a-sibling-visits-the-nicu': { asin: '1452545499' },
  'my-brother-is-a-preemie': { asin: '1451513089' },
  'evan-early': { asin: '1890627712' },
  'no-bigger-than-my-teddy-bear': { asin: '097284600X' },
  'watching-bradley-grow': { asin: '1563522829' },
  'the-very-tiny-baby': { asin: '1580894453' },
  'my-baby-sister-is-a-preemie': { asin: '031087033X' },
  'prince-preemie': { asin: '1615993061' },
  'our-respiratory-adventure': { asin: '1039150616' },
  'small-but-strong-nicu-families': {
    asin: 'B0C1J5GT44',
    coverImage: 'https://m.media-amazon.com/images/I/41BoSnZmGcL.jpg'
  }
};

function amazonProductId(url) {
  if (!url) return null;
  const path = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  if (path) return path[1].toUpperCase();
  const query = url.match(/[?&](?:asin|ASIN)=([A-Z0-9]{10})(?:&|$)/i);
  return query ? query[1].toUpperCase() : null;
}

function isDirectAmazonCover(url) {
  return typeof url === 'string' && /https:\/\/m\.media-amazon\.com\/images\/I\//i.test(url);
}

function isGeneratedAmazonCover(url) {
  return typeof url === 'string' && /https:\/\/(?:images\.amazon\.com|images-na\.ssl-images-amazon\.com|m\.media-amazon\.com)\/images\/P\//i.test(url);
}

function isPublicReady(book) {
  const status = String(book.verificationStatus ?? '').toLowerCase();
  const readyStatus = status.includes('ready') || status.includes('verified');
  return Boolean(
    readyStatus &&
    book.title &&
    book.author &&
    book.audience &&
    Array.isArray(book.medicalTopics) &&
    book.medicalTopics.length > 0 &&
    book.mlbSummary
  );
}

let nicuCount = 0;
let canonicalized = 0;
const unresolvedAmazon = [];
const unresolvedCover = [];
const publicFailures = [];

for (const book of books) {
  if (!Array.isArray(book.medicalTopics) || !book.medicalTopics.includes('NICU')) continue;
  nicuCount += 1;

  const verified = verifiedAmazon[book.slug];
  const existingAsin = amazonProductId(book.amazonProductUrl);
  const asin = verified?.asin ?? existingAsin;

  if (asin) {
    book.amazonProductUrl = `https://www.amazon.com/dp/${asin}?tag=mightylittle-20`;
    canonicalized += 1;
  } else {
    unresolvedAmazon.push(`${book.title} (${book.slug})`);
  }

  // Preserve confirmed direct Amazon artwork already in the catalog.
  // Remove only guessed /images/P/ values created by earlier repairs so the
  // render-time fallback chain can try Amazon and then a verified source cover.
  if (verified?.coverImage) {
    book.coverImage = verified.coverImage;
  } else if (isGeneratedAmazonCover(book.coverImage) && !isDirectAmazonCover(book.coverImage)) {
    book.coverImage = null;
  }

  const hasCoverSource = Boolean(book.coverImage || asin || book.isbn);
  if (!hasCoverSource) unresolvedCover.push(`${book.title} (${book.slug})`);

  if (isPublicReady(book)) {
    if (!asin) publicFailures.push(`${book.title}: missing confirmed Amazon product link`);
    if (!hasCoverSource) publicFailures.push(`${book.title}: missing usable cover source`);
  }
}

await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');

console.log(`NICU Amazon audit: ${nicuCount} records, ${canonicalized} canonical Amazon product links.`);
if (unresolvedAmazon.length) {
  console.warn(`Hidden/research NICU records still lacking an Amazon product match (${unresolvedAmazon.length}):\n- ${unresolvedAmazon.join('\n- ')}`);
}
if (unresolvedCover.length) {
  console.warn(`Hidden/research NICU records lacking any usable cover source (${unresolvedCover.length}):\n- ${unresolvedCover.join('\n- ')}`);
}

if (publicFailures.length) {
  throw new Error(`Public NICU catalog audit failed:\n- ${publicFailures.join('\n- ')}`);
}
