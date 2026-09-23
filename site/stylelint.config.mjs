// Design rules from site/DESIGN.md that code can enforce. Colours, fonts, radii, shadows,
// durations, and easing come from tokens.css, and every var(--…) must name a defined token
// (scripts/stylelint-known-tokens.mjs). Gradients, blur, and text shadows are not part of the
// design language. A justified exception uses a stylelint-disable comment that names the
// DESIGN.md rule it follows.
const token = (name) => `/^var\\(--${name}[\\w-]*\\)$/`;

export default {
  ignoreFiles: ["dist/**", "node_modules/**"],
  plugins: ["./scripts/stylelint-known-tokens.mjs"],
  overrides: [
    { files: ["**/*.astro"], customSyntax: "postcss-html" },
    {
      files: ["src/styles/tokens.css"],
      rules: { "color-no-hex": null, "declaration-property-value-allowed-list": null },
    },
  ],
  rules: {
    "atlas/known-tokens": true,
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "linear-gradient",
      "radial-gradient",
      "conic-gradient",
      "repeating-linear-gradient",
      "repeating-radial-gradient",
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "oklch",
      "oklab",
      "lab",
      "lch",
      "color-mix",
    ],
    // No glass: nothing blurs what lies under it (DESIGN.md → Shape and depth).
    "property-disallowed-list": ["text-shadow", "filter", "backdrop-filter", "-webkit-backdrop-filter"],
    "declaration-property-value-allowed-list": {
      "font-family": ["/^var\\(--font-(sans|reading|mono)\\)$/", "inherit"],
      // Radii are 2–4 px (mark, control, float) or 0, and 50% for circles (mapped marks, radios).
      "border-radius": ["/^((var\\(--radius-(mark|control|float)\\)|0)\\s*){1,4}$/", "50%"],
      // Shadows only on floating layers.
      "box-shadow": ["var(--shadow-float)", "none"],
      "transition-duration": [token("duration"), "0s"],
      "transition-timing-function": [token("ease")],
      "animation-duration": [token("duration"), "0s"],
      "animation-timing-function": [token("ease")],
      "text-transform": ["none"],
    },
    "declaration-property-value-disallowed-list": {
      // Shorthands must take timing from tokens too.
      transition: ["/\\d+m?s/", "/ease(?!\\))/", "/linear/", "/cubic-bezier/"],
      animation: ["/\\d+m?s/", "/ease(?!\\))/", "/linear/", "/cubic-bezier/"],
    },
  },
};
