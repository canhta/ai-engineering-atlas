import type { Lang } from "../i18n";

export const homeUrl = (lang: Lang) => `/${lang}/`;
export const mapUrl = (lang: Lang) => `/${lang}/map/`;
export const progressUrl = (lang: Lang) => `/${lang}/progress/`;
export const howUrl = (lang: Lang) => `/${lang}/how/`;
export const searchUrl = (lang: Lang) => `/${lang}/search/`;
export const libraryUrl = (lang: Lang) => `/${lang}/sources/`;
export const privacyUrl = (lang: Lang) => `/${lang}/privacy/`;
export const changesUrl = (lang: Lang) => `/${lang}/changelog/`;

/** The same page in another language: swap the leading locale segment. */
export const switchLang = (pathname: string, lang: Lang) => pathname.replace(/^\/(en|vi)(?=\/)/, `/${lang}`);
