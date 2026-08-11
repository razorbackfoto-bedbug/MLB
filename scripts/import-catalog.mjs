#!/usr/bin/env node
/**
 * Import / refresh src/data/books.json from a Master Catalog CSV export.
 *
 * Usage:
 *   node scripts/import-catalog.mjs path/to/Master_Catalog_export.csv
 *
 * Expected columns (same as the Mighty Little Bookshelf Master Catalog
 * spreadsheet's "Master Catalog" sheet, exported to CSV):
 *   Title, Author, Illustrator, Audience, Format, Medical Topics,
 *   Sibling Focus, Faith-Based, Recommended Age, ISBN, Publication Year,
 *   Amazon Product URL, Amazon Search URL, Affiliate Link, Publisher URL,
 *   MLB Original Summary, Verification Status, Source URL, Notes
 *
 * Books are matched to existing entries by slug (derived from title). New
 * titles are appended with default coverImage/featured values; hand-curated
 * fields on existing books (coverImage, featured, mlbSummary if you've
 * already written one) are preserved rather than overwritten with blanks.
 *
 * Because every page under /books/[slug] and /topics/[slug] is generated
 * from this JSON file via Astro's getStaticPaths, re-running this script
 * and committing the result is the entire workflow for adding new books —
 * no page needs to be hand-created.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'books.json');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-catalog.mjs <path-to-catalog.csv>');
  process.exit(1);
}
if (!existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, commas/newlines inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // skip, \n handles the line break
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function splitList(value) {
  return value
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean);
}

function mapAudience(raw) {
  const value = raw.trim();
  if (/parent/i.test(value)) return { audience: 'Parents & Adults', audienceTags: ['Parents'] };
  if (/^family$/i.test(value)) return { audience: 'Family', audienceTags: ['Families'] };
  return { audience: 'Children & Families', audienceTags: ['Children', 'Families'] };
}

function mapFormat(raw) {
  const value = raw.trim();
  if (/guide|memoir|adult/i.test(value)) return { format: 'Guide / Memoir', bookType: 'Guides & Resources' };
  if (/keepsake/i.test(value)) return { format: 'Keepsake Book', bookType: 'Keepsakes' };
  if (/activity/i.test(value)) return { format: 'Activity Book', bookType: 'Activity Books' };
  return { format: 'Storybook', bookType: 'Storybooks' };
}

function mapTriState(raw) {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value === 'yes') return true;
  if (value === 'no') return false;
  return null; // "possible / verify" or anything ambiguous
}

function toIntOrNull(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function nullableString(raw) {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

const csvText = readFileSync(csvPath, 'utf-8');
const rows = parseCsv(csvText);
const header = rows[0].map((h) => h.trim());
const col = (name) => header.indexOf(name);

const idx = {
  title: col('Title'),
  author: col('Author'),
  illustrator: col('Illustrator'),
  audience: col('Audience'),
  format: col('Format'),
  medicalTopics: col('Medical Topics'),
  siblingFocus: col('Sibling Focus'),
  faithBased: col('Faith-Based'),
  recommendedAge: col('Recommended Age'),
  isbn: col('ISBN'),
  publicationYear: col('Publication Year'),
  amazonProductUrl: col('Amazon Product URL'),
  affiliateLink: col('Affiliate Link'),
  publisherUrl: col('Publisher URL'),
  mlbSummary: col('MLB Original Summary'),
  verificationStatus: col('Verification Status'),
  sourceUrl: col('Source URL'),
  notes: col('Notes'),
};

if (idx.title === -1) {
  console.error('Could not find a "Title" column in the CSV header. Aborting.');
  process.exit(1);
}

const existing = existsSync(BOOKS_JSON_PATH) ? JSON.parse(readFileSync(BOOKS_JSON_PATH, 'utf-8')) : [];
const existingBySlug = new Map(existing.map((b) => [b.slug, b]));

const imported = [];
for (const row of rows.slice(1)) {
  const title = row[idx.title]?.trim();
  if (!title) continue;

  const slug = slugify(title);
  const prior = existingBySlug.get(slug);

  const { audience, audienceTags } = mapAudience(row[idx.audience] ?? '');
  const { format, bookType } = mapFormat(row[idx.format] ?? '');

  const book = {
    slug,
    title,
    coverImage: prior?.coverImage ?? null,
    featured: prior?.featured ?? false,
    author: nullableString(row[idx.author]) ?? prior?.author ?? null,
    illustrator: nullableString(row[idx.illustrator]) ?? prior?.illustrator ?? null,
    audience,
    audienceTags,
    format,
    bookType,
    medicalTopics: idx.medicalTopics !== -1 ? splitList(row[idx.medicalTopics] ?? '') : prior?.medicalTopics ?? [],
    siblingFocus: idx.siblingFocus !== -1 ? row[idx.siblingFocus]?.trim().toLowerCase() === 'yes' : prior?.siblingFocus ?? false,
    faithBased: idx.faithBased !== -1 ? mapTriState(row[idx.faithBased] ?? '') : prior?.faithBased ?? null,
    ageMin: prior?.ageMin ?? null,
    ageMax: prior?.ageMax ?? null,
    isbn: nullableString(row[idx.isbn]) ?? prior?.isbn ?? null,
    publicationYear: toIntOrNull(row[idx.publicationYear]) ?? prior?.publicationYear ?? null,
    amazonProductUrl: nullableString(row[idx.amazonProductUrl]) ?? prior?.amazonProductUrl ?? null,
    affiliateUrl: nullableString(row[idx.affiliateLink]) ?? prior?.affiliateUrl ?? null,
    publisherUrl: nullableString(row[idx.publisherUrl]) ?? prior?.publisherUrl ?? null,
    mlbSummary: nullableString(row[idx.mlbSummary]) ?? prior?.mlbSummary ?? null,
    verificationStatus: nullableString(row[idx.verificationStatus]) ?? prior?.verificationStatus ?? 'Needs metadata verification',
    sourceUrl: nullableString(row[idx.sourceUrl]) ?? prior?.sourceUrl ?? null,
    notes: nullableString(row[idx.notes]) ?? prior?.notes ?? null,
  };

  // Recommended Age isn't reliably structured in the source sheet yet; if a
  // future export starts providing a clean "min-max" value, parse it here.
  const ageRaw = row[idx.recommendedAge]?.trim();
  const ageMatch = ageRaw?.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
  if (ageMatch) {
    book.ageMin = parseInt(ageMatch[1], 10);
    book.ageMax = parseInt(ageMatch[2], 10);
  }

  imported.push(book);
}

writeFileSync(BOOKS_JSON_PATH, JSON.stringify(imported, null, 2) + '\n', 'utf-8');
console.log(`Imported ${imported.length} books -> ${path.relative(process.cwd(), BOOKS_JSON_PATH)}`);
const newCount = imported.filter((b) => !existingBySlug.has(b.slug)).length;
if (newCount) console.log(`  ${newCount} new title(s) added.`);
