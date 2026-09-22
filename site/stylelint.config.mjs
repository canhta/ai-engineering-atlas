// Design rules from site/DESIGN.md that code can enforce. Colours, fonts, radii,
// shadows, blur, durations, and easing come from tokens.css; gradients are not part
// of the design language. A justified exception uses a stylelint-disable comment
// that names the DESIGN.md rule it follows.
const token = (name) => `/^var\\(--${name}[\\w-]*\\)$/`;

export default {
  ignoreFiles: ["dist/**", "node_modules/**"],
  overrides: [
    { files: ["**/*.astro"], customSyntax: "postcss-html" },
    {
      files: ["src/styles/tokens.css"],
      rules: { "color-no-hex": null, "declaration-property-value-allowed-list": null },
    },
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
    "property-disallowed-list": ["text-shadow", "filter"],
    "declaration-property-value-allowed-list": {
      "font-family": ["/^var\\(--font-/", "inherit"],
      // One to four radius tokens (or 0), or 50% for circles.
      "border-radius": ["/^((var\\(--radius[\\w-]*\\)|0)\\s*){1,4}$/", "50%"],
      "box-shadow": [token("shadow"), "none"],
      "backdrop-filter": [token("blur"), "none"],
      "-webkit-backdrop-filter": [token("blur"), "none"],
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
