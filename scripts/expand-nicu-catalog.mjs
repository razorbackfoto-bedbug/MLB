import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

function addBook(book) {
  if (!books.some((entry) => entry.slug === book.slug)) books.push(book);
}

const base = {
  featured: false,
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families'],
  format: 'Storybook',
  bookType: 'Storybooks',
  siblingFocus: true,
  faithBased: false,
  affiliateUrl: null,
  retailerName: null,
  verificationStatus: 'Verified',
  sourceCollections: ['MLB NICU expansion']
};

addBook({ ...base,
  slug: 'waiting-for-max', title: 'Waiting for Max: A NICU Story',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781685552800-L.jpg',
  author: 'Emily Rosen', illustrator: 'Esther Diana', ageMin: 4, ageMax: 8,
  isbn: '9781685552800', publicationYear: 2025,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Coping & Feelings'],
  amazonProductUrl: null,
  publisherUrl: 'https://www.simonandschuster.com/books/Waiting-for-Max/Emily-Rosen/9781685552800',
  mlbSummary: 'Louise waits for her premature baby brother Max to come home from the NICU and uses her imagination to cope with the uncertainty, giving young siblings a hopeful and emotionally honest way to process a NICU stay.',
  sourceUrl: 'https://www.simonandschuster.com/books/Waiting-for-Max/Emily-Rosen/9781685552800',
  notes: 'Publisher confirms ages 4-8, 32 pages, ISBN, author and illustrator.'
});

addBook({ ...base,
  slug: 'waiting-for-baby-a-sibling-visits-the-nicu', title: 'Waiting for Baby: A Sibling Visits the NICU',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781452545493-L.jpg',
  author: 'Jennifer Bracci', illustrator: 'Angie Jones', ageMin: 4, ageMax: 8,
  isbn: '9781452545493', publicationYear: 2012,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Medical Equipment'],
  amazonProductUrl: null, publisherUrl: 'https://www.balboapress.com/en/bookstore/bookdetails/352342-Waiting-for-Baby',
  mlbSummary: 'A rhyming picture book follows a sibling into the NICU, introducing the unfamiliar sights, sounds, machines, and emotions of visiting a new baby who needs intensive care.',
  sourceUrl: 'https://www.balboapress.com/en/bookstore/bookdetails/352342-Waiting-for-Baby',
  notes: 'Publisher and pediatric hospital resources confirm title, creators, NICU focus and age range.'
});

addBook({ ...base,
  slug: 'my-brother-is-a-preemie', title: 'My Brother Is a Preemie: A Children’s Guide to the NICU Experience',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781451513080-L.jpg',
  author: 'Abraham R. Chuzzlewit', illustrator: null, ageMin: 3, ageMax: 9,
  isbn: '9781451513080', publicationYear: 2010,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Hospital Visits'],
  amazonProductUrl: null, publisherUrl: 'https://www.blurb.com/b/1200985-my-brother-is-a-preemie',
  mlbSummary: 'A short, child-friendly introduction to the NICU designed for siblings and young relatives, helping families talk about why a premature baby is in the hospital and what children may encounter during a visit.',
  sourceUrl: 'https://www.blurb.com/b/1200985-my-brother-is-a-preemie',
  notes: 'Current Blurb listing and hospital recommendations confirm NICU sibling focus; 2010 edition ISBN verified bibliographically.'
});

addBook({ ...base,
  slug: 'evan-early', title: 'Evan Early',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781890627713-L.jpg',
  author: 'Rebecca Hogue Wojahn', illustrator: null, ageMin: 4, ageMax: 8,
  isbn: '9781890627713', publicationYear: 2006,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education'],
  amazonProductUrl: null, publisherUrl: null,
  mlbSummary: 'A children’s book about premature birth that helps young readers understand a baby arriving early and the experiences surrounding prematurity and neonatal care.',
  sourceUrl: 'https://nidcap.org/families/resources-for-families/books-websites-and-more/',
  notes: 'Recommended by NIDCAP and neonatal sibling resource lists; ISBN and publisher metadata independently verified.'
});

addBook({ ...base,
  slug: 'no-bigger-than-my-teddy-bear', title: 'No Bigger Than My Teddy Bear',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9780972846004-L.jpg',
  author: 'Valerie Pankow', illustrator: 'Gwen Connelly', ageMin: 3, ageMax: 7,
  isbn: '9780972846004', publicationYear: 2004,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Medical Equipment'],
  amazonProductUrl: null, publisherUrl: null,
  mlbSummary: 'A young boy describes meeting his premature baby brother and the NICU equipment around him, helping siblings prepare for machines, lights, wires, and tubes while focusing on their connection to the new baby.',
  sourceUrl: 'https://www.platypusmedia.com/resources-for-nicu-families',
  notes: 'Recommended by multiple NICU and pediatric resources; ISBN and illustrator verified bibliographically.'
});

addBook({ ...base,
  slug: 'watching-bradley-grow', title: 'Watching Bradley Grow: A Story About Premature Birth',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781563522826-L.jpg',
  author: 'Elizabeth Murphy-Melas', illustrator: null, ageMin: 4, ageMax: 8,
  isbn: '9781563522826', publicationYear: 1995,
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Coping & Feelings'],
  amazonProductUrl: null, publisherUrl: null,
  mlbSummary: 'A big sister learns to cope with her premature baby brother’s hospitalization and the wait to meet him, offering children a relatable sibling perspective on premature birth and NICU separation.',
  sourceUrl: 'https://choc.org/child-life/book-resource-list/',
  notes: 'Recommended by CHOC and neonatal sibling resources; ISBN, author and publication metadata verified bibliographically.'
});

books.sort((a, b) => a.title.localeCompare(b.title));
await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');
console.log('Additional verified NICU catalog expansion applied.');
