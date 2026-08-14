#!/usr/bin/env node
// Broader research pass: for each medical topic, search Amazon for standalone
// Spanish-language children's books on that theme (NOT tied to a specific
// English catalog title — these are different stories, same subject). Filters
// out obviously irrelevant SERP noise (decor, food, apparel) and flags results
// that look like real books for manual verification.

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '..', 'spanish-topic-sweep-report.json');
const CLI = path.join('C:\\Users\\User\\tools\\node', 'node_modules', '@brightdata', 'cli', 'dist', 'index.js');

const CATEGORIES = [
  { topic: 'nicu-prematurity', queries: ['cuento infantil bebe prematuro UCIN', 'libro para ninos bebe prematuro'] },
  { topic: 'siblings', queries: ['cuento infantil hermano bebe en el hospital', 'libro para ninos hermano hospitalizado'] },
  { topic: 'hospital-stays', queries: ['libro infantil preparacion cirugia para ninos', 'cuento infantil ir al hospital'] },
  { topic: 'cardiac', queries: ['libro infantil cirugia del corazon para ninos', 'cuento infantil corazon congenito'] },
  { topic: 'respiratory', queries: ['libro infantil traqueostomia para ninos', 'cuento infantil oxigeno respirador ninos'] },
  { topic: 'feeding-tubes', queries: ['libro infantil sonda de alimentacion para ninos', 'cuento infantil sonda gastrica ninos'] },
  { topic: 'oncology', queries: ['libro infantil cancer quimioterapia para ninos', 'cuento infantil perdida de cabello cancer'] },
  { topic: 'genetics-rare-disease', queries: ['libro infantil enfermedad rara para ninos', 'cuento infantil sindrome genetico inclusion'] },
  { topic: 'grief-loss', queries: ['cuento infantil duelo perdida de un bebe', 'libro infantil perdida gestacional para ninos'] },
  { topic: 'parent-resources', queries: ['guia para padres bebe prematuro UCIN', 'libro para padres de ninos hospitalizados'] },
];

const DENYLIST = [
  'sauce', 'banner', 'balloon', 'backdrop', 'decoration', 'dickies', 'jean', 'aioli',
  'snack', 'chicken', 'toy', 'costume', 'candle', 'sticker', 'shirt', 'mug', 'party',
  'bunting', 'garland', 'wallpaper', 'phone case', 'necklace', 'earring',
];

function looksLikeBook(name) {
  const lower = (name || '').toLowerCase();
  if (DENYLIST.some((bad) => lower.includes(bad))) return false;
  return /libro|cuento|guia|book|edition|edici[oó]n/i.test(name || '');
}

const report = [];

for (const { topic, queries } of CATEGORIES) {
  const found = [];
  for (const q of queries) {
    process.stderr.write(`[${topic}] Searching: "${q}"\n`);
    try {
      const buf = execFileSync(
        process.execPath,
        [CLI, 'pipelines', 'amazon_product_search', q, 'https://www.amazon.com', '--format', 'json'],
        { stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 },
      );
      const results = JSON.parse(buf.toString());
      if (Array.isArray(results)) {
        for (const r of results.slice(0, 6)) {
          if (looksLikeBook(r.name)) {
            found.push({ query: q, name: r.name, asin: r.asin, url: r.url, price: r.final_price, rating: r.rating, numRatings: r.num_ratings });
          }
        }
      }
    } catch (err) {
      report.push({ topic, query: q, status: 'error', detail: String(err.message || err).slice(0, 200) });
    }
  }
  report.push({ topic, candidates: found });
}

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
process.stderr.write(`\nWrote report to ${REPORT_PATH}\n`);
