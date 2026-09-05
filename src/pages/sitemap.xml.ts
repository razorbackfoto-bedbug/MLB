import type { APIRoute } from 'astro';
import { getAllBooks, getAllTopics, getSpanishBooks } from '../lib/books';

export const prerender = true;

const SITE = 'https://mightylittlebookshelf.com';

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(path: string, priority: number, changefreq = 'weekly') {
  return [
    '  <url>',
    `    <loc>${xmlEscape(new URL(path, SITE).toString())}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');
}

export const GET: APIRoute = () => {
  const staticPaths = [
    ['/', 1.0],
    ['/library/', 0.9],
    ['/topics/', 0.9],
    ['/about/', 0.6],
    ['/contact/', 0.4],
    ['/es/', 0.8],
    ['/es/library/', 0.8],
    ['/es/topics/', 0.8],
    ['/es/about/', 0.5],
    ['/es/contact/', 0.4],
  ] as const;

  const urls: string[] = staticPaths.map(([path, priority]) => urlEntry(path, priority));

  for (const topic of getAllTopics()) {
    urls.push(urlEntry(`/topics/${topic.slug}/`, 0.8));
    urls.push(urlEntry(`/es/topics/${topic.slug}/`, 0.7));
  }

  for (const book of getAllBooks()) {
    urls.push(urlEntry(`/books/${book.slug}/`, 0.8, 'monthly'));
  }

  for (const book of getSpanishBooks()) {
    urls.push(urlEntry(`/es/books/${book.slug}/`, 0.7, 'monthly'));
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
