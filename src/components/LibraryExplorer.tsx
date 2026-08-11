import { useMemo, useState } from 'preact/hooks';
import type { Book, AgeBucket, Topic } from '../lib/books';
import { getAgeBucketForBook, formatAgeRange } from '../lib/books';
import { coverPaletteFor } from '../lib/cover';
import { badgeClassesFor } from '../lib/badges';

export type LibraryBook = Book & { topicSlugs: string[] };

interface Props {
  books: LibraryBook[];
  topics: Topic[];
  ageBuckets: AgeBucket[];
  audienceOptions: string[];
  bookTypeOptions: string[];
}

type SortKey = 'title-asc' | 'title-desc';

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset class="border-t border-teal-100 pt-4 first:border-t-0 first:pt-0">
      <legend class="font-body text-sm font-bold uppercase tracking-wide text-teal-700">{title}</legend>
      <div class="mt-3 flex flex-col gap-2">
        {options.map((opt) => (
          <label class="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-teal-300 text-teal-700 focus:ring-teal-500"
              checked={selected.has(opt.value)}
              onChange={() => onToggle(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LibraryBookCard({ book }: { book: LibraryBook }) {
  const palette = coverPaletteFor(book.slug);
  return (
    <article class="card flex h-full flex-col overflow-hidden p-3">
      <a href={`/books/${book.slug}/`} class="block">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            class="aspect-[3/4] w-full rounded-2xl object-cover shadow-card"
            loading="lazy"
          />
        ) : (
          <div
            class="relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 shadow-card"
            style={{ backgroundColor: palette.bg, color: palette.fg }}
            role="img"
            aria-label={`Cover placeholder for ${book.title}`}
          >
            <div class="absolute inset-y-0 right-0 w-2 bg-black/10" aria-hidden="true" />
            <svg class="h-5 w-5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-10-9.3C0.5 8 2.3 4 6.2 4c2.1 0 3.7 1.2 4.5 2.6C11.5 5.2 13.1 4 15.2 4c3.9 0 5.7 4 4.2 7.7C19.5 16.4 12 21 12 21Z" />
            </svg>
            <p class="font-display text-lg font-semibold leading-snug">{book.title}</p>
          </div>
        )}
      </a>
      <div class="flex flex-1 flex-col gap-2 pt-3">
        <a
          href={`/books/${book.slug}/`}
          class="font-display text-lg font-semibold leading-snug text-teal-700 hover:text-coral-500"
        >
          {book.title}
        </a>
        <p class="text-sm text-ink-light">{formatAgeRange(book)}</p>
        <div class="flex flex-wrap gap-1.5">
          {book.medicalTopics.slice(0, 2).map((topic) => (
            <span class={`pill ${badgeClassesFor(topic)}`}>{topic}</span>
          ))}
        </div>
        <a
          href={`/books/${book.slug}/`}
          class="mt-auto inline-flex items-center justify-center rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-cream-50 hover:bg-teal-600"
        >
          View Book
        </a>
      </div>
    </article>
  );
}

export default function LibraryExplorer({ books, topics, ageBuckets, audienceOptions, bookTypeOptions }: Props) {
  const [query, setQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedAudience, setSelectedAudience] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>('title-asc');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = books.filter((book) => {
      if (selectedAge.size) {
        const bucket = getAgeBucketForBook(book);
        if (!bucket || !selectedAge.has(bucket.slug)) return false;
      }
      if (selectedTopics.size) {
        const hasTopic = book.topicSlugs.some((slug) => selectedTopics.has(slug));
        if (!hasTopic) return false;
      }
      if (selectedAudience.size) {
        const hasAudience = book.audienceTags.some((a) => selectedAudience.has(a));
        if (!hasAudience) return false;
      }
      if (selectedTypes.size && !selectedTypes.has(book.bookType)) return false;
      if (q) {
        const haystack = [book.title, book.author ?? '', book.illustrator ?? '', ...book.medicalTopics]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) =>
      sort === 'title-asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    );

    return filtered;
  }, [books, query, selectedAge, selectedTopics, selectedAudience, selectedTypes, sort]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    for (const slug of selectedAge) {
      const bucket = ageBuckets.find((b) => b.slug === slug);
      if (bucket) chips.push({ key: `age-${slug}`, label: bucket.label, onRemove: () => setSelectedAge(toggle(selectedAge, slug)) });
    }
    for (const slug of selectedTopics) {
      const topic = topics.find((t) => t.slug === slug);
      if (topic) chips.push({ key: `topic-${slug}`, label: topic.label, onRemove: () => setSelectedTopics(toggle(selectedTopics, slug)) });
    }
    for (const a of selectedAudience) {
      chips.push({ key: `aud-${a}`, label: a, onRemove: () => setSelectedAudience(toggle(selectedAudience, a)) });
    }
    for (const t of selectedTypes) {
      chips.push({ key: `type-${t}`, label: t, onRemove: () => setSelectedTypes(toggle(selectedTypes, t)) });
    }
    return chips;
  }, [selectedAge, selectedTopics, selectedAudience, selectedTypes, ageBuckets, topics]);

  const clearAll = () => {
    setSelectedAge(new Set());
    setSelectedTopics(new Set());
    setSelectedAudience(new Set());
    setSelectedTypes(new Set());
  };

  return (
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
      <aside class="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
        <FilterGroup
          title="Age Range"
          options={ageBuckets.map((b) => ({ value: b.slug, label: b.label }))}
          selected={selectedAge}
          onToggle={(v) => setSelectedAge(toggle(selectedAge, v))}
        />
        <FilterGroup
          title="Topic"
          options={topics.map((t) => ({ value: t.slug, label: t.label }))}
          selected={selectedTopics}
          onToggle={(v) => setSelectedTopics(toggle(selectedTopics, v))}
        />
        <FilterGroup
          title="Audience"
          options={audienceOptions.map((a) => ({ value: a, label: a }))}
          selected={selectedAudience}
          onToggle={(v) => setSelectedAudience(toggle(selectedAudience, v))}
        />
        <FilterGroup
          title="Book Type"
          options={bookTypeOptions.map((t) => ({ value: t, label: t }))}
          selected={selectedTypes}
          onToggle={(v) => setSelectedTypes(toggle(selectedTypes, v))}
        />
        <button
          type="button"
          onClick={clearAll}
          class="w-full rounded-full border border-teal-200 px-4 py-2 text-sm font-semibold text-ink-light hover:bg-teal-50"
        >
          Clear All Filters
        </button>
      </aside>

      <div>
        <label for="library-search" class="sr-only">
          Search by title, keyword, topic, or diagnosis
        </label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-light"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m21 21-4.3-4.3" stroke-linecap="round"></path>
          </svg>
          <input
            id="library-search"
            type="search"
            placeholder="Search by title, keyword, topic, or diagnosis"
            class="w-full rounded-full border border-teal-200 bg-white py-3 pl-11 pr-4 text-ink placeholder:text-ink-light/70 focus:border-teal-500"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold text-ink-light">Showing {results.length} books</span>
            {activeChips.map((chip) => (
              <button
                type="button"
                onClick={chip.onRemove}
                class="pill bg-teal-100 text-teal-800 hover:bg-teal-200"
              >
                {chip.label}
                <span class="ml-1" aria-hidden="true">
                  ×
                </span>
              </button>
            ))}
            {activeChips.length > 0 && (
              <button type="button" onClick={clearAll} class="text-sm font-semibold text-coral-500 hover:text-coral-600">
                Clear all
              </button>
            )}
          </div>

          <label class="flex items-center gap-2 text-sm text-ink-light">
            Sort by:
            <select
              class="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-ink"
              value={sort}
              onChange={(e) => setSort((e.target as HTMLSelectElement).value as SortKey)}
            >
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div class="card mt-8 p-10 text-center">
            <p class="font-display text-lg text-teal-700">No books match those filters yet.</p>
            <p class="mt-2 text-sm text-ink-light">
              Try clearing a filter — many titles are still being verified for age range and topic detail.
            </p>
          </div>
        ) : (
          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((book) => (
              <LibraryBookCard key={book.slug} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
