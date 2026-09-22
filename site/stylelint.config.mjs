// Design rules from site/DESIGN.md that code can enforce. Colours, fonts, radii,
// and durations come from tokens.css; gradients, blur, and glass are not part of
// the design language. A justified exception uses a stylelint-disable comment
// that names the DESIGN.md rule it follows.
export default {
  ignoreFiles: ["dist/**", "node_modules/**"],
  overrides: [
    { files: ["**/*.astro"], customSyntax: "postcss-html" },
    { files: ["src/styles/tokens.css"], rules: { "color-no-hex": null } },
  ],
  rules: {
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
    "property-disallowed-list": ["backdrop-filter", "box-shadow", "text-shadow"],
    "declaration-property-value-allowed-list": {
      "font-family": ["/^var\\(--font-/", "inherit"],
      "border-radius": ["/^var\\(--radius/", "0", "50%"],
      "transition-duration": ["/^var\\(--duration/", "0s"],
      "text-transform": ["none"],
    },
  },
};
