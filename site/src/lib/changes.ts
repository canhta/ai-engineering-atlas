// The What changed page (DESIGN.md → Information architecture, What changed): the content model's
// dated changes grouped the way a changelog reads. Pure: takes the model's `changes`, returns groups.
import type { ChangeEntry, Changes } from "./atlas.ts";

export interface NumberedEntry extends ChangeEntry {
  /** Position in the record (oldest first); stable because the record is append-only. */
  index: number;
}

export interface ChangeDay {
  date: string;
  /** Newest first within the day. */
  entries: NumberedEntry[];
}

export interface ReleaseGroup {
  /** Absent for the unreleased group. */
  version?: string;
  date?: string;
  /** Newest day first. */
  days: ChangeDay[];
  /** Items named per kind, in the order kinds first appear from the newest entry. */
  counts: { kind: string; count: number }[];
}

/** Anchor of one entry on the What changed page. */
export const changeAnchor = (index: number) => `change-${index + 1}`;

const named = (e: ChangeEntry) => e.refs.length + (e.unlisted?.length ?? 0);

function group(entries: NumberedEntry[], version?: string, date?: string): ReleaseGroup {
  const newest = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
  const days: ChangeDay[] = [];
  for (const entry of newest) {
    const day = days.at(-1);
    if (day?.date === entry.date) day.entries.push(entry);
    else days.push({ date: entry.date, entries: [entry] });
  }
  const counts = new Map<string, number>();
  for (const entry of newest) counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + named(entry));
  return { version, date, days, counts: [...counts].map(([kind, count]) => ({ kind, count })) };
}

/**
 * Unreleased first (only when something is unreleased), then every release newest first, each
 * with its days newest first, as Keep a Changelog orders them. A release with no entries stays,
 * so the page says so rather than hiding the release.
 */
export function releaseGroups(changes: Changes): ReleaseGroup[] {
  const numbered = changes.entries.map((entry, index) => ({ ...entry, index }));
  const groups: ReleaseGroup[] = [];
  const unreleased = numbered.filter((e) => !e.release);
  if (unreleased.length) groups.push(group(unreleased));
  const releases = [...changes.releases].sort((a, b) => b.date.localeCompare(a.date));
  for (const release of releases)
    groups.push(
      group(
        numbered.filter((e) => e.release === release.version),
        release.version,
        release.date,
      ),
    );
  return groups;
}

/** The most recent recorded change naming this item, if any. */
export function latestChangeOf(changes: Changes, ref: string): NumberedEntry | undefined {
  for (let index = changes.entries.length - 1; index >= 0; index--) {
    const entry = changes.entries[index];
    if (entry.refs.includes(ref)) return { ...entry, index };
  }
  return undefined;
}

/** The day of the most recent change. */
export const lastChangeDate = (changes: Changes): string | undefined =>
  changes.entries.map((e) => e.date).sort((a, b) => b.localeCompare(a))[0];
