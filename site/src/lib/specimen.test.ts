import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRef, site, trackedCollection } from "./atlas.ts";
import { refOf } from "./refs.ts";
import { specimen, specimenItem } from "./specimen.ts";

// Reads the expected values from the content model, so promoting or editing a route does not fail it.
test("the specimen is the route the model names", () => {
  const item = specimenItem();
  assert.ok(item, "some ready route has a diagnostic, a source, and a step list");
  assert.ok(site.specimen, "the content model names a specimen");
  assert.equal(refOf(trackedCollection, item), site.specimen);
});

test("the specimen shows the route's first task, first source row, and last step list", () => {
  const s = specimen("en");
  assert.ok(s);
  const blocks = resolveRef(s.ref)?.item.page?.blocks ?? [];
  const diagnostic = blocks.find((b) => b.type === "diagnostic");
  const sources = blocks.find((b) => b.type === "sources");
  const last = blocks.filter((b) => b.type === "list" && b.step).at(-1);
  assert.equal(s.diagnostic.prompt.value, diagnostic?.type === "diagnostic" ? diagnostic.tasks[0].en : undefined);
  assert.equal(s.reading.locator.value, sources?.type === "sources" ? sources.rows[0].locator.en : undefined);
  assert.deepEqual(
    s.evidence.items.map((i) => i.value),
    last?.type === "list" ? last.items.map((i) => i.en) : undefined,
  );
  assert.equal(s.href, `/en/routes/${s.ref}/`);
});

test("on a page in another language, an English passage is marked untranslated", () => {
  const s = specimen("vi");
  assert.ok(s);
  const passages = [s.title, s.diagnostic.prompt, s.reading.locator, s.reading.purpose, ...s.evidence.items];
  assert.equal(
    s.untranslated,
    passages.some((p) => p.lang === "en"),
  );
});
