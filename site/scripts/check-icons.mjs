// Icons come from the installed library through src/lib/icons.ts only (DESIGN.md → Icons).
// The plate and its prerequisite lines are data visualisation: src/components/plate/ is the
// only folder allowed to emit SVG, and it may not import an icon package either.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const REGISTRY = "src/lib/icons.ts";
const PLATE = "src/components/plate/";
const ICON_PACKAGES = /from\s+["'](@carbon\/icons[\w/-]*|lucide[\w/-]*|@phosphor-icons\/[\w-]+|@tabler\/icons[\w-]*|@heroicons\/[\w/-]+|react-icons[\w/-]*|@radix-ui\/react-icons)["']/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const errors = [];
for (const dir of ["src", "public"]) {
  for (const path of walk(join(root, dir))) {
    const rel = relative(root, path);
    if (rel.endsWith(".svg")) {
      errors.push(`${rel}: SVG files are not allowed; use an icon from ${REGISTRY}`);
      continue;
    }
    if (!/\.(astro|tsx?|jsx?|mjs|css|html|md|json)$/.test(rel)) continue;
    if (rel.startsWith("src/data/")) continue; // generated curriculum text
    const text = readFileSync(path, "utf8");
    if (!rel.startsWith(PLATE) && (/<svg[\s>]/i.test(text) || /<path\s/i.test(text))) {
      errors.push(`${rel}: inline <svg>/<path> outside ${PLATE}; use <Icon name=…> or ${REGISTRY}`);
    }
    if (rel !== REGISTRY && ICON_PACKAGES.test(text)) {
      errors.push(`${rel}: imports an icon package directly; import from ${REGISTRY}`);
    }
    const glyph = text.match(/\p{Extended_Pictographic}|[↗↘✓✔✗✘★☆]/u);
    if (glyph) {
      errors.push(`${rel}: emoji or symbol "${glyph[0]}" used as an icon; use <Icon name=…> with a text label`);
    }
    if (/url\(\s*["']?data:image\/svg/i.test(text)) {
      errors.push(`${rel}: SVG data URI; use an icon from ${REGISTRY}`);
    }
  }
}

if (errors.length) {
  console.error("Icon check failed:\n");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`OK: icons come only from ${REGISTRY}; SVG only in ${PLATE}`);
