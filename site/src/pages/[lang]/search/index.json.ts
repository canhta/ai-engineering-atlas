// The search index for one language (DESIGN.md → Information architecture), built from the content
// model at build time and emitted as a static, same-origin JSON asset: /{lang}/search/index.json.
// The Search island fetches it, so the model never ships to the browser.
import type { APIRoute } from "astro";
import { langPaths, type Lang, useTranslations } from "../../../i18n";
import { searchIndex } from "../../../lib/summaries";

export const prerender = true;
export const getStaticPaths = langPaths;

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const t = useTranslations(lang);
  const index = searchIndex(lang, {
    routes: t("search.routes"),
    practisesFor: t("collection.practisesFor"),
    covers: t("collection.covers"),
    citedBy: t("search.citedBy"),
    library: t("library.title"),
  });
  return new Response(JSON.stringify(index), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
