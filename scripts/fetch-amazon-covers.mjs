#!/usr/bin/env node
// One-off tool: for each book in src/data/books.json missing an amazonProductUrl,
// search Amazon via the Bright Data CLI, take the best-matching result, and
// record product URL + full-res cover image. Writes a review report alongside
// the updated books.json so low-confidence matches can be checked by hand.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'books.json');
const REPORT_PATH = path.join(__dirname, '..', 'amazon-cover-report.json');
const TMP_DIR = process.env.TEMP || process.env.TMP || '/tmp';

function normalize(title) {
  return title
    .toLowerCase()
    .replace(/[():,.!?'"]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'your', 'with'].includes(w));
}

function scoreMatch(bookTitle, resultName) {
  const bookWords = new Set(normalize(bookTitle));
  const resultWords = new Set(normalize(resultName));
  if (bookWords.size === 0) return 0;
  let hits = 0;
  for (const w of bookWords) if (resultWords.has(w)) hits++;
  return hits / bookWords.size;
}

function fullResImage(url) {
  if (!url) return url;
  return url.replace(/\._[A-Z0-9,_]+_\.jpg$/i, '.jpg');
}

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const books = JSON.parse(readFileSync(BOOKS_JSON_PATH, 'utf-8').replace(/^﻿/, ''));
const report = [];
let updated = 0;
let processed = 0;

for (const book of books) {
  if (processed >= limit) break;
  if (book.amazonProductUrl) {
    continue; // already has a real product URL, skip
  }

  processed++;
  process.stderr.write(`Searching: ${book.title}\n`);
  const outFile = path.join(TMP_DIR, `mlb-cover-${book.slug}.json`);

  try {
    const cliEntry = path.join('C:\\Users\\User\\tools\\node', 'node_modules', '@brightdata', 'cli', 'dist', 'index.js');
    execFileSync(
      process.execPath,
      [cliEntry, 'pipelines', 'amazon_product_search', book.title, 'https://www.amazon.com', '--format', 'json', '-o', outFile],
      { stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 }
    );
  } catch (err) {
    report.push({ slug: book.slug, title: book.title, status: 'error', detail: String(err.message || err).slice(0, 300) });
    continue;
  }

  let results;
  try {
    results = JSON.parse(readFileSync(outFile, 'utf-8'));
  } catch {
    report.push({ slug: book.slug, title: book.title, status: 'no-output' });
    continue;
  }

  if (!Array.isArray(results) || results.length === 0) {
    report.push({ slug: book.slug, title: book.title, status: 'no-results' });
    continue;
  }

  // Rank candidates by (title relevance, then Amazon's own rank_on_page).
  const candidates = results
    .filter((r) => r.url && r.image)
    .map((r) => ({ r, score: scoreMatch(book.title, r.name || '') }))
    .sort((a, b) => b.score - a.score || (a.r.rank_on_page ?? 99) - (b.r.rank_on_page ?? 99));

  const best = candidates[0];
  if (!best || best.score < 0.5) {
    report.push({
      slug: book.slug,
      title: book.title,
      status: 'low-confidence',
      bestGuess: best ? { name: best.r.name, url: best.r.url, score: best.score } : null,
    });
    continue;
  }

  book.amazonProductUrl = best.r.url;
  book.coverImage = fullResImage(best.r.image);
  updated++;
  report.push({
    slug: book.slug,
    title: book.title,
    status: 'matched',
    matchedName: best.r.name,
    score: best.score,
    amazonProductUrl: book.amazonProductUrl,
    coverImage: book.coverImage,
  });
}

writeFileSync(BOOKS_JSON_PATH, JSON.stringify(books, null, 2) + '\n', 'utf-8');
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');

console.log(`Done. ${updated} books matched and updated.`);
console.log(`Report written to ${path.relative(process.cwd(), REPORT_PATH)}`);
