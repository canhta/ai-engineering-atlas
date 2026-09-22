// Dates shown to learners (VIETNAMESE_STYLE.md → Punctuation and numbers): the page locale's
// format through Intl, never by hand. Vietnamese pages read dd/mm/yyyy; English pages "Jan 1, 2026".
// Files keep ISO dates (progress.yaml); render them inside <time dateTime={iso}>.
import type { Lang } from "../i18n";

const OPTIONS: Record<Lang, Intl.DateTimeFormatOptions> = {
  en: { day: "numeric", month: "short", year: "numeric" },
  vi: { day: "2-digit", month: "2-digit", year: "numeric" },
};

const formatters = new Map<Lang, Intl.DateTimeFormat>();

/** An ISO date (yyyy-mm-dd) in the page locale; unparseable input is returned unchanged. */
export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  let formatter = formatters.get(lang);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(lang, { ...OPTIONS[lang], timeZone: "UTC" });
    formatters.set(lang, formatter);
  }
  return formatter.format(date);
}
