import assert from "node:assert/strict";
import { test } from "node:test";
import { highlight, search, type SearchIndex } from "./search.ts";

const entry = (title: string, extra: Partial<SearchIndex["kinds"][number]["entries"][number]> = {}) => ({
  title: { value: title, lang: "en" },
  href: `/${title}`,
  ...extra,
});

const index: SearchIndex = {
  kinds: [
    {
      id: "routes",
      label: { value: "Routes", lang: "en" },
      entries: [
        entry("Agent tool use"),
        entry("Tool Calling", { terms: "AI engineering" }),
        entry("Evals", { context: { parts: [{ value: "Tool Calling", lang: "en" }] } }),
        entry("Kỹ năng đánh giá"),
      ],
    },
    { id: "sources", label: { value: "Library", lang: "en" }, entries: [entry("A Book", { terms: "Tooley" })] },
  ],
};

const titles = (query: string) => search(index, query).map((k) => [k.id, k.entries.map((e) => e.title.value)]);

test("an empty query finds nothing", () => {
  assert.deepEqual(search(index, "   "), []);
});

test("results keep their kind; titles starting with the query come first; kinds without a hit drop", () => {
  assert.deepEqual(titles("tool"), [
    ["routes", ["Tool Calling", "Agent tool use"]],
    ["sources", ["A Book"]],
  ]);
  assert.deepEqual(titles("calling"), [["routes", ["Tool Calling"]]]);
});

test("every word must occur in the title or the terms; the context line is not searched", () => {
  assert.deepEqual(titles("tool engineering"), [["routes", ["Tool Calling"]]]);
  assert.deepEqual(titles("tool nothing"), []);
});

test("matching ignores case and Vietnamese diacritics, both ways", () => {
  assert.deepEqual(titles("ky nang danh gia"), [["routes", ["Kỹ năng đánh giá"]]]);
  assert.deepEqual(titles("ĐÁNH"), [["routes", ["Kỹ năng đánh giá"]]]);
});

test("highlight marks every occurrence in the original characters", () => {
  assert.deepEqual(highlight("Kỹ năng đánh giá", "danh"), [
    { text: "Kỹ năng ", hit: false },
    { text: "đánh", hit: true },
    { text: " giá", hit: false },
  ]);
  assert.deepEqual(highlight("Tool tools", "TOOL"), [
    { text: "Tool", hit: true },
    { text: " ", hit: false },
    { text: "tool", hit: true },
    { text: "s", hit: false },
  ]);
  assert.deepEqual(highlight("Plain", ""), [{ text: "Plain", hit: false }]);
});
