import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./dates.ts";

test("dates follow the page locale: dd/mm/yyyy in Vietnamese, the en format in English", () => {
  assert.equal(formatDate("2026-01-01", "vi"), "01/01/2026");
  assert.equal(formatDate("2026-09-29", "vi"), "29/09/2026");
  assert.equal(formatDate("2026-09-29", "en"), "Sep 29, 2026");
});

test("an unparseable date is shown as given", () => {
  assert.equal(formatDate("soon", "vi"), "soon");
});
