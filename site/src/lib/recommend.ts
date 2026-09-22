// Deterministic next-step recommendation (web atlas RFC → Phase 2; docs/LEARNING_MODEL.md → AI tutor
// contract: "recommend a next competency from prerequisites and learner state"). This file is the
// only place the rules live. The result is advice: it never changes a state, and it reads only
// recorded states and review dates, never opened sources or self-reported confidence.
//
// Rules, in priority order (an item appears at most once, under its first matching rule):
//   1. due       a delayed-retrieval check is due (review date on or before today), earliest first.
//                Listed even when the item has reached its target: retention is re-checked.
//   2. continue  the item is in gap or learning.
//   3. start     the item is unassessed and every prerequisite is demonstrated or beyond, or has a
//                bridge on the item's page. Other prerequisites block the start and are reported.
//   4. transfer  demonstrated, below target: attempt the transfer task.
//   5. apply     transferred or retained, target applied: use it in a project.
// Items without a page, and items at or above their target (outside rule 1), are never listed.
// Ties within a rule follow the content model's item order. With `{ due: false }` (Progress, where
// the review queue sits beside the list) items with a due check are left out entirely.
import type { Collection, Item, Relation } from "./atlas.ts";
import { isDemonstrated, type Progress, rank, type State } from "./progress.ts";
import { refOf } from "./refs.ts";

export interface PlanOptions {
  /** List items whose check is due (rule 1). Default true. */
  due?: boolean;
}

export type Reason = "due" | "continue" | "start" | "transfer" | "apply";
export const REASONS: readonly Reason[] = ["due", "continue", "start", "transfer", "apply"];

/** One tracked item as the recommendation sees it; built by a page from the content model. */
export interface GraphItem {
  id: string;
  /** Position in the content model's item order: the tie-break. */
  order: number;
  /** Whether the item has a page (a route the learner can follow). */
  page: boolean;
  /** Highest declared target state; the learner's own target in progress.yaml wins. */
  target?: string;
  /** Declared prerequisites, each with whether this item's page carries a bridge for it. */
  needs: { id: string; bridged: boolean }[];
}

/**
 * The graph from content-model data: the tracked collection's items in model order, whether each
 * has a page, its highest target, and its `prerequisite` relations with the bridges its
 * prerequisites block carries. Takes plain model data so tests can run it over atlas.json.
 */
export function graphOf(c: Collection, items: readonly Item[], relations: readonly Relation[]): GraphItem[] {
  const targetField = c.progress?.target_field;
  return items.map((item, order) => {
    const id = refOf(c, item);
    const bridged = new Set(
      (item.page?.blocks ?? []).flatMap((b) =>
        b.type === "prerequisites" ? b.items.filter((p) => p.bridge).map((p) => p.ref) : [],
      ),
    );
    const targets = targetField === undefined ? [] : [item.fields[targetField] ?? []].flat().map(String);
    return {
      id,
      order,
      page: Boolean(item.page),
      target: targets.at(-1),
      needs: relations
        .filter((r) => r.type === "prerequisite" && r.to === id)
        .map((r) => ({ id: r.from, bridged: bridged.has(r.from) })),
    };
  });
}

export interface Recommendation {
  id: string;
  reason: Reason;
  /** Prerequisites not yet demonstrated and not bridged (informational for `continue`). */
  prerequisites: string[];
  /** Review date for `due`. */
  due?: string;
}

export interface Blocked {
  id: string;
  /** Prerequisites to learn first, in content order. */
  prerequisites: string[];
}

export interface Plan {
  /** Every recommendation, ranked. */
  next: Recommendation[];
  /** Unstarted items with a page whose start is blocked by prerequisites. */
  blocked: Blocked[];
}

export const NEXT_LIMIT = 5;

const stateIn = (progress: Progress | null, id: string): State =>
  progress?.competencies[id]?.current_state ?? "unassessed";

export function plan(
  graph: readonly GraphItem[],
  progress: Progress | null,
  today: string,
  options: PlanOptions = {},
): Plan {
  const items = [...graph].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const orderOf = new Map(items.map((item) => [item.id, item.order]));
  const byOrder = (a: string, b: string) =>
    (orderOf.get(a) ?? Infinity) - (orderOf.get(b) ?? Infinity) || (a < b ? -1 : a > b ? 1 : 0);
  const unmet = (item: GraphItem) =>
    item.needs
      .filter((need) => !need.bridged && !isDemonstrated(stateIn(progress, need.id)))
      .map((need) => need.id)
      .filter((id, i, all) => all.indexOf(id) === i)
      .sort(byOrder);

  const buckets: Record<Reason, Recommendation[]> = { due: [], continue: [], start: [], transfer: [], apply: [] };
  const blocked: Blocked[] = [];

  for (const item of items) {
    if (!item.page) continue;
    const entry = progress?.competencies[item.id];
    const state = stateIn(progress, item.id);
    const target = entry?.target_state ?? item.target ?? "demonstrated";

    if (entry?.review_on && entry.review_on <= today) {
      if (options.due ?? true)
        buckets.due.push({ id: item.id, reason: "due", prerequisites: [], due: entry.review_on });
      continue;
    }
    if (rank(state) >= rank(target as State)) continue;

    if (state === "gap" || state === "learning") {
      buckets.continue.push({ id: item.id, reason: "continue", prerequisites: unmet(item) });
    } else if (state === "unassessed") {
      const blocking = unmet(item);
      if (blocking.length) blocked.push({ id: item.id, prerequisites: blocking });
      else buckets.start.push({ id: item.id, reason: "start", prerequisites: [] });
    } else if (state === "demonstrated") {
      buckets.transfer.push({ id: item.id, reason: "transfer", prerequisites: [] });
    } else if (target === "applied") {
      buckets.apply.push({ id: item.id, reason: "apply", prerequisites: [] });
    }
    // transferred with target retained: the review queue brings it back when the check is due.
  }

  buckets.due.sort((a, b) => (a.due! < b.due! ? -1 : a.due! > b.due! ? 1 : byOrder(a.id, b.id)));
  return { next: REASONS.flatMap((reason) => buckets[reason]), blocked };
}

/** The first `limit` recommendations. */
export const recommend = (
  graph: readonly GraphItem[],
  progress: Progress | null,
  today: string,
  limit = NEXT_LIMIT,
  options: PlanOptions = {},
) => plan(graph, progress, today, options).next.slice(0, limit);

/** What the plan says about one item: a recommendation, what blocks it, or nothing. */
export function adviceFor(result: Plan, id: string): { next?: Recommendation; blocked?: Blocked } {
  return { next: result.next.find((r) => r.id === id), blocked: result.blocked.find((b) => b.id === id) };
}

/** Whether the learner has recorded any evidence (Home shows the next list only then). */
export const hasEvidence = (progress: Progress | null) =>
  Object.values(progress?.competencies ?? {}).some((entry) => entry.evidence.length > 0);
