import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

const fixes = {
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

let updated = 0;
for (const book of books) {
  const fix = fixes[book.slug];
  if (!fix) continue;
  book.amazonProductUrl = `https://www.amazon.com/dp/${fix.asin}?tag=mightylittle-20`;
  book.coverImage = fix.coverImage ?? `https://images.amazon.com/images/P/${fix.asin}.01.LZZZZZZZ.jpg`;
  updated += 1;
}

await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');
console.log(`Applied Amazon product links and Amazon-hosted covers to ${updated} NICU records.`);
