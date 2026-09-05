import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

function addBook(book) {
  if (!books.some((entry) => entry.slug === book.slug)) books.push(book);
}

addBook({
  slug: 'the-very-tiny-baby',
  title: 'The Very Tiny Baby',
  coverImage: 'https://dynamic.indigoimages.ca/v1/books/books/1580894453/1.jpg',
  featured: false,
  author: 'Sylvie Kantorovitz',
  illustrator: 'Sylvie Kantorovitz',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families', 'Siblings'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Coping & Feelings'],
  siblingFocus: true,
  faithBased: false,
  ageMin: 3,
  ageMax: 7,
  isbn: '9781580894456',
  publicationYear: 2014,
  amazonProductUrl: 'https://www.amazon.com/dp/1580894453',
  affiliateUrl: null,
  publisherUrl: 'https://www.charlesbridge.com/products/the-very-tiny-baby',
  retailerName: null,
  mlbSummary: 'Jacob struggles with fear, anger, confusion, and feeling left behind when his new sibling is born much too early and remains in the NICU. The story gives families an unusually honest way to talk with older siblings about prematurity, parental absence, and complicated feelings.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://www.penguinrandomhouse.com/books/236743/the-very-tiny-baby-by-sylvie-kantorovitz-authorillustrator/',
  notes: 'Publisher metadata confirms author/illustrator, ISBN, 2014 publication, 32 pages, and ages 3-7. Also recommended by neonatal sibling-support resources.',
  sourceCollections: ['MLB NICU expansion', 'Neonatal sibling-support resources']
});

addBook({
  slug: 'my-baby-sister-is-a-preemie',
  title: 'My Baby Sister Is a Preemie',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9780310870333-L.jpg',
  featured: false,
  author: 'Diana M. Amadeo',
  illustrator: null,
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families', 'Siblings'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['NICU', 'Prematurity', 'Sibling Education', 'Hospital Stay', 'Faith'],
  siblingFocus: true,
  faithBased: true,
  ageMin: 4,
  ageMax: 8,
  isbn: '9780310870333',
  publicationYear: 2009,
  amazonProductUrl: 'https://www.amazon.com/s?k=9780310870333',
  affiliateUrl: null,
  publisherUrl: null,
  retailerName: null,
  mlbSummary: 'Sarah is frightened and confused when her baby sister arrives early and is cared for in the NICU. A nurse explains the unfamiliar tubes and wires, while the family’s Christian faith is used to reassure Sarah during the hospitalization.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://openlibrary.org/books/OL33421421M/My_Baby_Sister_Is_a_Preemie',
  notes: 'Bibliographic record confirms author, Zonderkidz edition, ISBN, 32 pages, and NICU subject matter. Faith-based content is explicitly tagged.',
  sourceCollections: ['MLB NICU expansion', 'Illinois Early Intervention Clearinghouse', 'Neonatal sibling-support resources']
});

addBook({
  slug: 'prince-preemie',
  title: 'Prince Preemie: A Tale of a Tiny Puppy Who Arrives Early',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781615993062-L.jpg',
  featured: false,
  author: 'Jewel Kats',
  illustrator: 'Claudia Marie Lenart',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families', 'Siblings'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['NICU', 'Prematurity', 'Coping & Feelings', 'Courage & Resilience'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 4,
  ageMax: 8,
  isbn: '9781615993062',
  publicationYear: 2016,
  amazonProductUrl: 'https://www.amazon.com/s?k=9781615993062',
  affiliateUrl: null,
  publisherUrl: 'https://www.jewelkats.com/',
  retailerName: null,
  mlbSummary: 'A fairy-tale story about a tiny puppy prince who arrives before anyone expected. The metaphor gives young children a gentle way to begin talking about premature birth, the worry that can surround an early arrival, and the strength of babies who start life small.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://www.jewelkats.com/wp-content/uploads/2014/06/JewelKats_2017_cat.pdf',
  notes: 'Author catalog confirms author, illustrator, paperback ISBN, 2016 publication, 32 pages, and ages 4-7. Recommended by Hand to Hold.',
  sourceCollections: ['MLB NICU expansion', 'Hand to Hold recommended books']
});

addBook({
  slug: 'small-but-strong-nicu-families',
  title: 'Small But Strong: A Story for NICU Families',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9798988120810-L.jpg',
  featured: false,
  author: 'Deidre Grieves',
  illustrator: 'Kseniia Kudriavtseva',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families', 'Parents'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['NICU', 'Prematurity', 'NICU Milestones', 'Courage & Resilience'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 2,
  ageMax: 8,
  isbn: '9798988120810',
  publicationYear: 2023,
  amazonProductUrl: 'https://www.amazon.com/s?k=9798988120810',
  affiliateUrl: null,
  publisherUrl: null,
  retailerName: null,
  mlbSummary: 'A hopeful illustrated story following diverse NICU families through the highs and lows of prematurity, celebrating perseverance, connection, and the small milestones that can mean so much during a neonatal intensive care stay.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://books.google.com/books/about/Small_But_Strong.html?id=_NjNzwEACAAJ',
  notes: 'Google Books confirms author, illustrator, publisher, ISBN, 2023 publication, and 34-page format. Also listed by the Illinois Early Intervention Clearinghouse as a children’s NICU resource.',
  sourceCollections: ['MLB NICU expansion', 'Illinois Early Intervention Clearinghouse']
});

books.sort((a, b) => a.title.localeCompare(b.title));
await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');
console.log('NICU catalog expansion batch 3 applied.');
