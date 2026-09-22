// Verify WCAG 2.2 AA contrast for semantic token pairs in light and dark themes.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g;
const darkMatch = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?\})\s*\}/);
const lightCss = darkMatch ? css.replace(darkMatch[0], "") : css;

const parse = (text) => Object.fromEntries([...text.matchAll(DECL)].map((m) => [m[1], m[2].trim()]));
const light = parse(lightCss);
const themes = { light, dark: { ...light, ...parse(darkMatch?.[1] ?? "") } };

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ["--text", "--bg", 4.5, "body text"],
  ["--text", "--bg-component", 4.5, "text on components"],
  ["--text-muted", "--bg", 4.5, "secondary text, coverage rows"],
  ["--text-muted", "--bg-subtle", 4.5, "secondary text on subtle background"],
  ["--link", "--bg", 4.5, "links"],
  ["--action-text", "--action-bg", 4.5, "primary action label"],
  ["--action-text", "--action-bg-hover", 4.5, "primary action label, hover"],
  ["--state-gap", "--bg", 4.5, "gap state label"],
  ["--state-demonstrated", "--bg", 4.5, "demonstrated state label"],
  ["--state-beyond", "--bg", 4.5, "transferred/retained/applied labels"],
  ["--pass", "--bg", 4.5, "passing test label"],
  ["--fail", "--bg", 4.5, "failing test label"],
  ["--focus", "--bg", 3, "focus ring (1.4.11)"],
  ["--border-strong", "--bg", 3, "borders that carry meaning (1.4.11)"],
  ["--ready-marker", "--bg", 3, "ready marker (1.4.11)"],
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
