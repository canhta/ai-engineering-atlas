import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { emptyProgress, fromYaml, recordEvidence, type EvidenceInput, type Progress, type State } from "./progress.ts";
import { adviceFor, graphOf, hasEvidence, NEXT_LIMIT, plan, REASONS, recommend, type GraphItem } from "./recommend.ts";

const DAY = "2026-09-22";

// A small graph: two roots, a chain, a bridged coverage prerequisite, and an unbridged one.
//   a (root) → b → d ;  c (root) ;  x (no page) bridged on e ;  y (no page) not bridged on f
const node = (id: string, order: number, needs: [string, boolean][] = [], page = true, target = "applied"): GraphItem => ({
  id,
  order,
  page,
  target,
  needs: needs.map(([need, bridged]) => ({ id: need, bridged })),
});
const GRAPH: GraphItem[] = [
  node("a", 0),
  node("b", 1, [["a", false]]),
  node("c", 2, [], true, "transferred"),
  node("d", 3, [["b", false]]),
  node("x", 4, [], false),
  node("e", 5, [["x", true]]),
  node("y", 6, [], false),
  node("f", 7, [["y", false]]),
];

const evidence = (supports: State): EvidenceInput => ({
  kind: "implementation",
  supports_state: supports as EvidenceInput["supports_state"],
  independence: "independent",
  review_method: "self",
  note: "fixture",
});

/** Progress with one evidence record per item, recorded against the item's declared target (as the field log does). */
function withStates(states: Record<string, State>, date = DAY, graph = GRAPH): Progress {
  let p = emptyProgress(date);
  for (const [id, s] of Object.entries(states)) {
    const target = (graph.find((g) => g.id === id)?.target ?? "demonstrated") as Progress["competencies"][string]["target_state"];
    p = recordEvidence(p, id, evidence(s), target, date);
  }
  return p;
}

const ids = (list: { id: string }[]) => list.map((r) => r.id);

test("empty progress: only roots and bridged items start; nothing else is listed", () => {
  const result = plan(GRAPH, emptyProgress(DAY), DAY);
  assert.deepEqual(result.next, [
    { id: "a", reason: "start", prerequisites: [] },
    { id: "c", reason: "start", prerequisites: [] },
    { id: "e", reason: "start", prerequisites: [] },
  ]);
  assert.deepEqual(result.blocked, [
    { id: "b", prerequisites: ["a"] },
    { id: "d", prerequisites: ["b"] },
    { id: "f", prerequisites: ["y"] },
  ]);
  assert.deepEqual(plan(GRAPH, null, DAY), result);
});

test("a due review outranks everything, earliest first", () => {
  let p = withStates({ a: "demonstrated", b: "gap", c: "demonstrated" }, "2026-08-01");
  p.competencies.c.review_on = "2026-09-20";
  p.competencies.a.review_on = "2026-09-22";
  const next = plan(GRAPH, p, DAY).next;
  assert.deepEqual(next.slice(0, 2), [
    { id: "c", reason: "due", prerequisites: [], due: "2026-09-20" },
    { id: "a", reason: "due", prerequisites: [], due: "2026-09-22" },
  ]);
  assert.equal(next[2].reason, "continue");
  // Not yet due: the item goes back to its own rule.
  p = { ...p, competencies: { ...p.competencies, a: { ...p.competencies.a, review_on: "2026-09-23" } } };
  assert.deepEqual(
    plan(GRAPH, p, DAY).next.find((r) => r.id === "a"),
    { id: "a", reason: "transfer", prerequisites: [] },
  );
});

test("{ due: false } leaves items with a due check out entirely, and changes nothing else", () => {
  const p = withStates({ a: "demonstrated", b: "gap", c: "demonstrated" }, "2026-08-01");
  p.competencies.a.review_on = "2026-09-20";
  p.competencies.c.review_on = "2026-12-01";
  const all = plan(GRAPH, p, DAY);
  const without = plan(GRAPH, p, DAY, { due: false });
  assert.equal(all.next[0].id, "a");
  assert.deepEqual(without.next, all.next.filter((r) => r.id !== "a"));
  assert.deepEqual(without.blocked, all.blocked);
  assert.deepEqual(ids(recommend(GRAPH, p, DAY, 2, { due: false })), ["b", "e"]);
});

test("a due review is listed even at target; otherwise items at target are excluded", () => {
  const p = withStates({ c: "transferred" }, "2026-08-01");
  assert.equal(plan(GRAPH, p, "2026-08-02").next.find((r) => r.id === "c"), undefined);
  p.competencies.c.review_on = "2026-08-02";
  assert.equal(plan(GRAPH, p, "2026-08-02").next[0].reason, "due");
});

test("rule order: due, continue, start, transfer, apply", () => {
  const p = withStates({ a: "demonstrated", c: "learning", e: "transferred" });
  assert.deepEqual(
    plan(GRAPH, p, DAY).next.map((r) => [r.id, r.reason]),
    [
      ["c", "continue"],
      ["b", "start"],
      ["a", "transfer"],
      ["e", "apply"],
    ],
  );
});

test("a bridge on the page unblocks a coverage prerequisite", () => {
  assert.equal(adviceFor(plan(GRAPH, null, DAY), "e").next?.reason, "start");
  const unbridged = GRAPH.map((g) => (g.id === "e" ? node("e", 5, [["x", false]]) : g));
  assert.deepEqual(adviceFor(plan(unbridged, null, DAY), "e"), { next: undefined, blocked: { id: "e", prerequisites: ["x"] } });
});

test("a coverage prerequisite without a bridge blocks until it is demonstrated", () => {
  assert.deepEqual(adviceFor(plan(GRAPH, null, DAY), "f").blocked, { id: "f", prerequisites: ["y"] });
  const p = withStates({ y: "demonstrated" });
  assert.equal(adviceFor(plan(GRAPH, p, DAY), "f").next?.reason, "start");
});

test("a paged prerequisite unblocks once demonstrated; gap does not", () => {
  assert.deepEqual(adviceFor(plan(GRAPH, withStates({ a: "gap" }), DAY), "b").blocked?.prerequisites, ["a"]);
  assert.equal(adviceFor(plan(GRAPH, withStates({ a: "demonstrated" }), DAY), "b").next?.reason, "start");
});

test("continue carries unmet prerequisites; items without a page are never listed", () => {
  const p = withStates({ d: "gap", x: "learning" });
  const result = plan(GRAPH, p, DAY);
  assert.deepEqual(adviceFor(result, "d").next, { id: "d", reason: "continue", prerequisites: ["b"] });
  assert.equal(adviceFor(result, "x").next, undefined);
});

test("target reached: nothing to do; the learner's own target wins over the declared one", () => {
  const p = withStates({ a: "applied", c: "transferred" });
  const result = plan(GRAPH, p, DAY);
  assert.equal(adviceFor(result, "a").next, undefined);
  assert.equal(adviceFor(result, "c").next, undefined);
  const own = withStates({ a: "demonstrated" });
  assert.equal(adviceFor(plan(GRAPH, own, DAY), "a").next?.reason, "transfer");
  own.competencies.a.target_state = "demonstrated";
  assert.equal(adviceFor(plan(GRAPH, own, DAY), "a").next, undefined);
});

test("transferred with target retained waits for the review queue", () => {
  const graph = [node("r", 0, [], true, "retained")];
  assert.deepEqual(plan(graph, withStates({ r: "transferred" }, DAY, graph), DAY).next, []);
  assert.equal(plan(graph, withStates({ r: "demonstrated" }, DAY, graph), DAY).next[0].reason, "transfer");
});

test("determinism: shuffled input gives the same output", () => {
  const p = withStates({ a: "demonstrated", b: "gap", e: "demonstrated" });
  const expected = plan(GRAPH, p, DAY);
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let round = 0; round < 20; round += 1) {
    const shuffled = [...GRAPH]
      .map((g) => ({ ...g, needs: [...g.needs].sort(() => random() - 0.5) }))
      .sort(() => random() - 0.5);
    assert.deepEqual(plan(shuffled, p, DAY), expected);
  }
});

test("recommend caps the ranked list", () => {
  const many = Array.from({ length: 9 }, (_, i) => node(`n${i}`, i));
  assert.equal(recommend(many, null, DAY).length, NEXT_LIMIT);
  assert.deepEqual(ids(recommend(many, null, DAY, 3)), ["n0", "n1", "n2"]);
  assert.equal(plan(many, null, DAY).next.length, 9);
});

test("hasEvidence is false for empty progress and true after one record", () => {
  assert.equal(hasEvidence(null), false);
  assert.equal(hasEvidence(emptyProgress(DAY)), false);
  assert.equal(hasEvidence(withStates({ a: "gap" })), true);
});

// ---------------------------------------------------------------- Real content model

const model = JSON.parse(readFileSync(new URL("../data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c: { progress?: { tracks: boolean } }) => c.progress?.tracks);
const realGraph = graphOf(tracked, model.items[tracked.id], model.relations);
const example = fromYaml(readFileSync(new URL("../../../progress/progress.example.yaml", import.meta.url), "utf8"));

test("the real model with the example progress.yaml gives a valid, stable plan", () => {
  assert.deepEqual(example.errors, []);
  const byId = new Map(realGraph.map((g) => [g.id, g]));
  const result = plan(realGraph, example.progress!, DAY);
  assert.ok(result.next.length > 0);
  const seen = new Set<string>();
  for (const r of result.next) {
    assert.ok(byId.get(r.id)?.page, `${r.id} has a page`);
    assert.ok(REASONS.includes(r.reason));
    assert.ok(!seen.has(r.id), `${r.id} listed once`);
    seen.add(r.id);
    for (const p of r.prerequisites) assert.ok(byId.has(p), `${p} is a tracked item`);
  }
  for (const b of result.blocked) {
    assert.ok(!seen.has(b.id));
    assert.ok(b.prerequisites.length > 0);
  }
  const reasons = result.next.map((r) => REASONS.indexOf(r.reason));
  assert.deepEqual(reasons, [...reasons].sort((x, y) => x - y), "rules stay in priority order");
  // The example has ai.evaluation in gap and llm.self-attention demonstrated (review not due on DAY).
  assert.deepEqual(result.next[0], { id: "ai.evaluation", reason: "continue", prerequisites: [] });
  assert.ok(result.next.some((r) => r.id === "llm.self-attention" && r.reason === "transfer"));
  assert.deepEqual(plan([...realGraph].reverse(), example.progress!, DAY), result);
  // On its review date self-attention comes first.
  assert.deepEqual(plan(realGraph, example.progress!, "2026-09-29").next[0], {
    id: "llm.self-attention",
    reason: "due",
    prerequisites: [],
    due: "2026-09-29",
  });
});

test("the real model with empty progress starts only where no prerequisite blocks", () => {
  const byId = new Map(realGraph.map((g) => [g.id, g]));
  const result = plan(realGraph, null, DAY);
  assert.ok(result.next.every((r) => r.reason === "start"));
  for (const r of result.next) {
    for (const need of byId.get(r.id)!.needs) assert.ok(need.bridged, `${r.id} needs ${need.id}, bridged on the page`);
  }
  assert.ok(result.next.length > 0 && result.blocked.length > 0);
  for (const b of result.blocked) assert.ok(b.prerequisites.every((p) => byId.has(p)));
});
