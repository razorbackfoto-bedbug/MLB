#!/usr/bin/env node
// One-off research tool: for a hand-picked list of catalog slugs likely to have
// real Spanish-language editions, search Amazon via Bright Data and report the
// best candidate match (if any) so a human can verify before adding to books.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'books.json');
const REPORT_PATH = path.join(__dirname, '..', 'spanish-editions-report.json');
const TMP_DIR = process.env.TEMP || process.env.TMP || '/tmp';
const CLI = path.join('C:\\Users\\User\\tools\\node', 'node_modules', '@brightdata', 'cli', 'dist', 'index.js');

// slug -> search query to try on amazon.com
const CANDIDATES = {
  'the-invisible-string': 'El Hilo Invisible Patrice Karst',
  'ida-always': 'Ida Siempre Caron Levis',
  'the-goodbye-book': 'El libro de las despedidas Todd Parr',
  'chester-raccoon-and-the-acorn-full-of-memories': 'Chester el mapache Audrey Penn español',
  'taking-cancer-to-school': 'Llevando el cancer a la escuela Kim Gosselin',
  'dont-call-me-special': 'No me llames especial Pat Thomas',
  'a-kids-book-about-cancer': 'A Kids Book About Cancer español edicion',
  'gentle-willow': 'Sauce Suave Joyce Mills',
  'understanding-the-nicu': 'Entendiendo la UCIN AAP',
  'preemies-the-essential-guide': 'Bebes prematuros guia esencial para padres',
  'my-belly-has-two-buttons': 'Mi Pancita Tiene Dos Botones Meikele Lee',
  'lemon-the-duck': 'Lemon the Duck español',
  'someone-came-before-you': 'Alguien vino antes que tu Pat Schwiebert',
  'the-thing-about-georgie': 'Lo que le pasa a Georgie Lisa Graff español',
  'welcome-to-the-nicu': 'Bienvenido a la UCIN',
};

const books = JSON.parse(readFileSync(BOOKS_JSON_PATH, 'utf-8').replace(/^\uFEFF/, ''));
const bySlug = new Map(books.map((b) => [b.slug, b]));

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[():,.!?'"]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function looksSpanish(name) {
  return /spanish edition|espa[ñn]ol/i.test(name);
}

const report = [];

for (const [slug, query] of Object.entries(CANDIDATES)) {
  const book = bySlug.get(slug);
  if (!book) {
    report.push({ slug, status: 'unknown-slug' });
    continue;
  }
  process.stderr.write(`Searching (ES): ${book.title} -> "${query}"\n`);
  const outFile = path.join(TMP_DIR, `mlb-es-${slug}.json`);
  try {
    execFileSync(
      process.execPath,
      [CLI, 'pipelines', 'amazon_product_search', query, 'https://www.amazon.com', '--format', 'json', '-o', outFile],
      { stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 },
    );
  } catch (err) {
    report.push({ slug, title: book.title, query, status: 'error', detail: String(err.message || err).slice(0, 300) });
    continue;
  }

  let results;
  try {
    results = JSON.parse(readFileSync(outFile, 'utf-8'));
  } catch {
    report.push({ slug, title: book.title, query, status: 'no-output' });
    continue;
  }

  if (!Array.isArray(results) || results.length === 0) {
    report.push({ slug, title: book.title, query, status: 'no-results' });
    continue;
  }

  const spanishResults = results.filter((r) => looksSpanish(r.name || ''));
  const candidates = spanishResults.length > 0 ? spanishResults : results;
  const best = candidates[0];

  report.push({
    slug,
    title: book.title,
    query,
    status: 'found',
    isMarkedSpanish: looksSpanish(best.name || ''),
    matchedName: best.name,
    asin: best.asin,
    url: best.url,
    image: best.image,
    price: best.final_price,
    rating: best.rating,
    numRatings: best.num_ratings,
    allTop3: results.slice(0, 3).map((r) => ({ name: r.name, isSpanish: looksSpanish(r.name || '') })),
  });
}

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
process.stderr.write(`\nWrote report to ${REPORT_PATH}\n`);
