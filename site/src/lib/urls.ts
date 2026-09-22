import type { Lang } from "../i18n";

export const homeUrl = (lang: Lang) => `/${lang}/`;
export const mapUrl = (lang: Lang) => `/${lang}/map/`;
export const routeUrl = (lang: Lang, id: string) => `/${lang}/routes/${id}/`;

/** The same page in another language: swap the leading locale segment. */
export const switchLang = (pathname: string, lang: Lang) => pathname.replace(/^\/(en|vi)(?=\/)/, `/${lang}`);
