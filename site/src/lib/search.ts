// Search across everything (DESIGN.md → Information architecture): the index shape the build emits
// per language (src/pages/[lang]/search/index.json.ts) and the pure matching the Search island runs
// on it. Free of the content model, so the island can import it and node tests can run it.

/** Text with the language it is in (as `Localized` in atlas.ts, kept local so this stays pure). */
export interface Phrase {
  value: string;
  lang: string;
}

/** One searchable item: a page (route, lab, project) or a cited source. */
export interface SearchEntry {
  title: Phrase;
  href: string;
  /** The link leaves the atlas (a source). */
  external?: boolean;
  /** One line of context: an optional lead, then phrases, then how many more were left out. */
  context?: { lead?: string; parts: Phrase[]; more?: number };
  /** Other words that find the entry besides its title (its region, the English title, author, host). */
  terms?: string;
}

/** Results of one kind (a collection, or the Library's sources), in the order the atlas lists them. */
export interface SearchKind {
  id: string;
  label: Phrase;
  entries: SearchEntry[];
}

export interface SearchIndex {
  kinds: SearchKind[];
}

/**
 * Case- and accent-insensitive form of one character: "Ệ" → "e", "đ" → "d". Vietnamese learners
 * often type without diacritics, so "ky nang" must find "kỹ năng".
 */
const foldChar = (ch: string) => ch.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/giu, "d").toLowerCase();

/** The folded text, and for each folded position the index of the original character it came from. */
export function fold(text: string): { folded: string; origin: number[] } {
  let folded = "";
  const origin: number[] = [];
  let index = 0;
  for (const ch of text) {
    const f = foldChar(ch);
    folded += f;
    for (let i = 0; i < f.length; i++) origin.push(index);
    index += ch.length;
  }
  origin.push(index);
  return { folded, origin };
}

/** The query as folded words; an entry matches when every word occurs somewhere in it. */
export const queryWords = (query: string) => fold(query).folded.split(/\s+/).filter(Boolean);

/** How well a text holds the words: 0 starts with the first, 1 a word starts with it, 2 inside, -1 missing one. */
function rank(text: string, words: string[]): number {
  const { folded } = fold(text);
  if (!words.every((w) => folded.includes(w))) return -1;
  const first = words[0];
  if (folded.startsWith(first)) return 0;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(folded) ? 1 : 2;
}

// The context line is not searched as such: a project's route list would make every route query find it.
const haystack = (entry: SearchEntry) => `${entry.title.value} ${entry.terms ?? ""}`;

/**
 * The kinds narrowed to the entries holding every query word, each kind's entries ordered by where
 * the title matches (start, word start, inside, elsewhere), otherwise in index order. Kinds with no
 * match are dropped; an empty query matches nothing.
 */
export function search(index: SearchIndex, query: string): SearchKind[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  return index.kinds
    .map((kind) => ({
      ...kind,
      entries: kind.entries
        .map((entry, order) => {
          if (rank(haystack(entry), words) < 0) return undefined;
          const title = rank(entry.title.value, words);
          return { entry, score: title < 0 ? 3 : title, order };
        })
        .filter((hit) => hit !== undefined)
        .sort((a, b) => a.score - b.score || a.order - b.order)
        .map((hit) => hit.entry),
    }))
    .filter((kind) => kind.entries.length > 0);
}

/** A text cut into plain and matched runs, for emphasising what the query found. */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const words = queryWords(query);
  const { folded, origin } = fold(text);
  const marked = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    for (let at = folded.indexOf(word); at >= 0; at = folded.indexOf(word, at + word.length)) {
      for (let i = origin[at]; i < origin[at + word.length]; i++) marked[i] = true;
    }
  }
  const runs: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = runs.at(-1);
    if (last && last.hit === marked[i]) last.text += text[i];
    else runs.push({ text: text[i], hit: marked[i] });
  }
  return runs;
}
