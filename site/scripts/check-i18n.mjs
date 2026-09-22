// Every UI string key exists, non-empty, in every language, with the same {params};
// Vietnamese values stay within 1.3 × the English length + 12 characters.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../src/i18n/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const dicts = Object.fromEntries(files.map((f) => [f.replace(".json", ""), JSON.parse(readFileSync(new URL(f, dir), "utf8"))]));
const reference = dicts.en;
const params = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

const errors = [];
for (const [lang, dict] of Object.entries(dicts)) {
  for (const key of Object.keys(reference)) {
    if (!(key in dict)) errors.push(`${lang}: missing key "${key}"`);
    else if (!dict[key].trim()) errors.push(`${lang}: empty value for "${key}"`);
    else if (params(dict[key]) !== params(reference[key])) errors.push(`${lang}: "${key}" params differ from en`);
    // Bloated translations read as machine-made (site/AGENTS.md → Bilingual).
    else if (lang === "vi" && dict[key].length > 1.3 * reference[key].length + 12) {
      errors.push(`vi: "${key}" is ${dict[key].length} characters; keep it under ${Math.floor(1.3 * reference[key].length + 12)} (1.3 × en + 12)`);
    }
  }
  for (const key of Object.keys(dict)) {
    if (!(key in reference)) errors.push(`${lang}: extra key "${key}" not in en`);
  }
}

if (errors.length) {
  console.error("i18n check failed:\n");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`OK: ${Object.keys(reference).length} UI strings present in ${Object.keys(dicts).join(", ")}`);
