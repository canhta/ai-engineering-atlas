// Verify WCAG 2.2 AA contrast for semantic token pairs in light and dark themes.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g;
const darkMatch = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?\})\s*\}/);
const lightCss = darkMatch ? css.replace(darkMatch[0], "") : css;

const parse = (text) => Object.fromEntries([...text.matchAll(DECL)].map((m) => [m[1], m[2].trim()]));
const light = parse(lightCss);
const themes = { light, dark: { ...light, ...parse(darkMatch?.[1] ?? "") } };

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ["--ink", "--ground", 4.5, "body text"],
  ["--ink", "--sheet", 4.5, "text on raised surfaces"],
  ["--ink-muted", "--ground", 4.5, "secondary text"],
  ["--ink-muted", "--sheet", 4.5, "secondary text on raised surfaces"],
  ["--water", "--ground", 4.5, "links"],
  ["--water", "--sheet", 4.5, "links on raised surfaces"],
  ["--route", "--ground", 4.5, "route-coloured labels"],
  ["--route", "--sheet", 4.5, "route-coloured labels on raised surfaces"],
  ["--on-route", "--route", 4.5, "primary action label"],
  ["--on-route", "--route-press", 4.5, "primary action label, pressed"],
  ["--state-gap", "--ground", 4.5, "gap state label"],
  ["--state-gap", "--sheet", 4.5, "gap state label on raised surfaces"],
  ["--state-learning", "--ground", 4.5, "learning state label"],
  ["--state-learning", "--sheet", 4.5, "learning state label on raised surfaces"],
  ["--state-demonstrated", "--ground", 4.5, "demonstrated state label"],
  ["--state-demonstrated", "--sheet", 4.5, "demonstrated state label on raised surfaces"],
  ["--state-transferred", "--ground", 4.5, "transferred state label"],
  ["--state-transferred", "--sheet", 4.5, "transferred state label on raised surfaces"],
  ["--state-retained", "--ground", 4.5, "retained state label"],
  ["--state-retained", "--sheet", 4.5, "retained state label on raised surfaces"],
  ["--state-applied", "--ground", 4.5, "applied state label"],
  ["--state-applied", "--sheet", 4.5, "applied state label on raised surfaces"],
  ["--code-keyword", "--sheet", 4.5, "editor keywords"],
  ["--code-string", "--sheet", 4.5, "editor strings"],
  ["--code-number", "--sheet", 4.5, "editor numbers"],
  ["--code-definition", "--sheet", 4.5, "editor definitions"],
  ["--code-comment", "--sheet", 4.5, "editor comments"],
  ["--line-strong", "--ground", 3, "tile outlines and input borders (1.4.11)"],
  ["--line-strong", "--sheet", 3, "tile outlines and input borders on raised surfaces (1.4.11)"],
  ["--focus", "--ground", 3, "focus ring (1.4.11)"],
  ["--focus", "--sheet", 3, "focus ring on raised surfaces (1.4.11)"],
];

function resolve(theme, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`cycle at ${name}`);
  seen.add(name);
  const value = theme[name];
  if (value === undefined) throw new Error(`undefined token ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(theme, ref[1], seen) : value;
}

function luminance(hex) {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? [...n].map((c) => c + c).join("") : n;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const failures = [];
for (const [themeName, theme] of Object.entries(themes)) {
  for (const [fg, bg, min, why] of PAIRS) {
    const r = ratio(resolve(theme, fg), resolve(theme, bg));
    if (r < min) failures.push(`${themeName}: ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1 (${why})`);
  }
}

if (failures.length) {
  console.error("Contrast check failed:\n");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`OK: ${PAIRS.length} token pairs meet WCAG AA in light and dark themes`);
