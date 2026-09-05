import fs from 'node:fs/promises';

const booksPath = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await fs.readFile(booksPath, 'utf8'));

function mergeUnique(existing = [], incoming = []) {
  return Array.from(new Set([...existing, ...incoming]));
}

function patchBook(slug, updates) {
  const book = books.find((entry) => entry.slug === slug);
  if (!book) {
    console.warn(`Catalog repair skipped missing book: ${slug}`);
    return;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'medicalTopics' || key === 'audienceTags' || key === 'sourceCollections') {
      book[key] = mergeUnique(book[key], value);
      continue;
    }

    if (key === 'verificationStatus') {
      const current = String(book.verificationStatus ?? '').toLowerCase();
      if (!current.includes('ready') && !current.includes('verified')) book[key] = value;
      continue;
    }

    if (book[key] == null || book[key] === '') book[key] = value;
  }
}

function addBook(book) {
  if (!books.some((entry) => entry.slug === book.slug)) books.push(book);
}

patchBook('our-respiratory-adventure', {
  author: 'Dr. Prem Fort and Adam Wood',
  illustrator: 'Seniya Golubeva',
  isbn: '9781039150614',
  publicationYear: 2022,
  publisherUrl: 'https://books.friesenpress.com/store/title/119734000248536207/Dr.-Prem-Fort-and-Adam-Wood-Our-Respiratory-Adventure',
  mlbSummary: 'Written by a neonatologist and a micro-preemie dad, this illustrated NICU story introduces common breathing support and respiratory equipment through the experiences of premature babies and their families.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://books.friesenpress.com/store/title/119734000248536207/Dr.-Prem-Fort-and-Adam-Wood-Our-Respiratory-Adventure',
  sourceCollections: ['MLB respiratory expansion']
});

patchBook('a-trach-baby-story', {
  author: 'Shecara Squires Reives',
  illustrator: 'Ethan Colchamiro',
  publicationYear: 2021,
  mlbSummary: 'Inspired by the author’s own premature baby, this picture book follows a NICU child through the tracheostomy journey and gives families a child-friendly way to talk about a trach, surgery, and the equipment that helps a baby breathe.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://rooksbooks.com/',
  sourceCollections: ['MLB respiratory expansion']
});

patchBook('goodnight-nicu', {
  author: 'Allison Kleinschmidt',
  publicationYear: 2023,
  mlbSummary: 'A gentle read-aloud for parents saying goodnight to a premature or medically fragile baby who remains in the NICU, written by a mother whose son spent 55 days there after being born at 29 weeks.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://goodnightnicu.com/'
});

patchBook('big-sis-visits-the-nicu', {
  author: 'Terri Major-Kincade, MD',
  publicationYear: 2021,
  mlbSummary: 'Six-year-old Nicole visits her baby brother after he is born early and admitted to the NICU, helping young siblings understand the unfamiliar environment while staying connected to the new baby.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://www.cmh.edu/your-visit/before-you-arrive/what-to-expect/helpful-books-for-patients-and-their-families/'
});

patchBook('n-is-for-nicu', {
  author: 'Alyssa Veech',
  illustrator: 'Penny Weber',
  publicationYear: 2023,
  ageMin: 2,
  ageMax: 8,
  mlbSummary: 'An alphabet-style introduction to the neonatal intensive care unit, pairing NICU words and experiences with watercolor illustrations so families can talk through the people, equipment, and routines a child may encounter.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://www.target.com/p/-/A-89307338'
});

patchBook('p-is-for-preemie', {
  author: 'Terri Major-Kincade, MD',
  mlbSummary: 'A child-friendly preemie story from neonatologist Terri Major-Kincade that helps families introduce premature birth and the NICU in reassuring language for young readers.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://drterrimd.com/'
});

patchBook('welcome-to-the-nicu', {
  author: 'Shecara Squires Reives',
  mlbSummary: 'A welcoming picture book for families entering the NICU, introducing the experience of having a baby born early while emphasizing the baby’s progress, strength, and milestones.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://rooksbooks.com/'
});

addBook({
  slug: 'taking-asthma-to-school',
  title: 'Taking Asthma to School',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781891383014-L.jpg',
  featured: false,
  author: 'Kim Gosselin',
  illustrator: 'Moss Freedman',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families'],
  format: 'Storybook',
  bookType: 'Educational',
  medicalTopics: ['Respiratory', 'Asthma', 'Inhaler', 'Chronic Illness', 'School & Friends'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 5,
  ageMax: 10,
  isbn: '9781891383014',
  publicationYear: 1998,
  amazonProductUrl: 'https://www.amazon.com/dp/1891383019',
  affiliateUrl: null,
  publisherUrl: null,
  retailerName: null,
  mlbSummary: 'A school-age child explains what asthma feels like, what can trigger an attack, and how medicine and an asthma plan help keep symptoms under control, while classmates learn why a friend may need different routines.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://openlibrary.org/books/OL711423M/Taking_asthma_to_school',
  notes: 'Second edition metadata verified through Open Library and Google Books.',
  sourceCollections: ['MLB respiratory expansion']
});

addBook({
  slug: 'taking-cystic-fibrosis-to-school',
  title: 'Taking Cystic Fibrosis to School',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781891383090-L.jpg',
  featured: false,
  author: 'Cynthia S. Henry',
  illustrator: 'Tom Dineen',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families'],
  format: 'Storybook',
  bookType: 'Educational',
  medicalTopics: ['Respiratory', 'Cystic Fibrosis', 'Genetics', 'Chronic Illness', 'School & Friends'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 4,
  ageMax: 8,
  isbn: '9781891383090',
  publicationYear: 2000,
  amazonProductUrl: null,
  affiliateUrl: null,
  publisherUrl: 'https://www.at-risk.com/products/taking-cystic-fibrosis-to-school-book',
  retailerName: 'The Bureau for At-Risk Youth',
  mlbSummary: 'Jessie explains everyday life with cystic fibrosis to classmates, helping children understand why someone with CF may need treatments, medicines, and different routines while still participating in ordinary school life.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://www.at-risk.com/products/taking-cystic-fibrosis-to-school-book',
  notes: 'Recommended by Dartmouth Health Children’s; current retailer listing confirms author, illustrator, grade range, and 32-page format.',
  sourceCollections: ['MLB respiratory expansion']
});

addBook({
  slug: 'the-abilities-in-me-tracheostomy',
  title: 'The Abilities in Me: Tracheostomy',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9798674992721-L.jpg',
  featured: false,
  author: 'Gemma Keir',
  illustrator: 'Adam Walker-Parker',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['Respiratory', 'Tracheostomy', 'Medical Equipment', 'Inclusion', 'Living With a Trach'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 3,
  ageMax: 8,
  isbn: '9798674992721',
  publicationYear: 2020,
  amazonProductUrl: 'https://www.amazon.com/s?k=9798674992721',
  affiliateUrl: null,
  publisherUrl: 'https://theabilitiesinme.com/the-book-titles',
  retailerName: null,
  mlbSummary: 'A bright day-in-the-life story about a young boy with a tracheostomy, created to help children understand the device, build acceptance, and see a trach as one part of an active child’s everyday life.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://books.google.com/books/about/The_Abilities_in_Me.html?id=orsdzgEACAAJ',
  notes: 'Bibliographic details verified through Google Books and the official Abilities in Me title list.',
  sourceCollections: ['MLB respiratory expansion']
});

addBook({
  slug: 'the-abilities-in-me-cystic-fibrosis',
  title: 'The Abilities in Me: Cystic Fibrosis',
  coverImage: 'https://covers.openlibrary.org/b/isbn/9781739546052-L.jpg',
  featured: false,
  author: 'Gemma Keir',
  illustrator: 'Yevheniia Lisovaya',
  audience: 'Children & Families',
  audienceTags: ['Children', 'Families'],
  format: 'Storybook',
  bookType: 'Storybooks',
  medicalTopics: ['Respiratory', 'Cystic Fibrosis', 'Genetics', 'Chronic Illness', 'Inclusion'],
  siblingFocus: false,
  faithBased: false,
  ageMin: 3,
  ageMax: 8,
  isbn: '9781739546052',
  publicationYear: 2023,
  amazonProductUrl: null,
  affiliateUrl: null,
  publisherUrl: 'https://theabilitiesinme.com/the-book-titles',
  retailerName: null,
  mlbSummary: 'A rhyming picture book following a young girl with cystic fibrosis through everyday life and treatments, showing how family support, routines, and medical care fit alongside the rest of childhood.',
  verificationStatus: 'Verified',
  sourceUrl: 'https://books.google.com/books/about/The_Abilities_in_Me.html?id=tajY0AEACAAJ',
  notes: 'Bibliographic details verified through Google Books and the official Abilities in Me title list.',
  sourceCollections: ['MLB respiratory expansion']
});

books.sort((a, b) => a.title.localeCompare(b.title));
await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, 'utf8');
console.log('NICU and respiratory catalog repair applied.');
