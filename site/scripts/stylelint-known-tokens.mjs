// Stylelint rule `atlas/known-tokens`: every var(--name) must be a token defined in
// src/styles/tokens.css, a font variable from the Astro font config, or a custom property the
// same file declares. A deleted token therefore cannot keep a use (DESIGN.md → Visual system).
import { readFileSync } from "node:fs";
import stylelint from "stylelint";

const ruleName = "atlas/known-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  unknown: (name) => `Unknown token "${name}": use a role from src/styles/tokens.css`,
});

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const defined = new Set([
  ...[...read("../src/styles/tokens.css").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
  ...[...read("../astro.config.mjs").matchAll(/cssVariable:\s*"(--[\w-]+)"/g)].map((m) => m[1]),
]);

const rule = (enabled) => (root, result) => {
  if (!enabled) return;
  const local = new Set();
  root.walkDecls((decl) => {
    if (decl.prop.startsWith("--")) local.add(decl.prop);
  });
  root.walkDecls((decl) => {
    for (const [, name] of decl.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (defined.has(name) || local.has(name)) continue;
      stylelint.utils.report({ ruleName, result, node: decl, word: name, message: messages.unknown(name) });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export default stylelint.createPlugin(ruleName, rule);
