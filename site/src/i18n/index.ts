import en from "./en.json";
import vi from "./vi.json";

export const languages = { en: "English", vi: "Tiếng Việt" } as const;
export type Lang = keyof typeof languages;
export type Key = keyof typeof en;

const dictionaries: Record<Lang, Record<Key, string>> = { en, vi };

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

export function useTranslations(lang: Lang) {
  return (key: Key, params: Record<string, string | number> = {}) =>
    dictionaries[lang][key].replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export const langPaths = () => (Object.keys(languages) as Lang[]).map((lang) => ({ params: { lang } }));
