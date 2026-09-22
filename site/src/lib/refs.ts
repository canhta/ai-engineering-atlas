// Item references of the content model (rfcs/0000-content-model.md): `<ref_prefix>:<id>`, or the
// bare id for a collection without a prefix. Pure and free of the model JSON, so atlas.ts,
// recommend.ts, and node tests share the one definition.
import type { Collection, Item } from "./atlas.ts";

/** Reference string for an item. */
export const refOf = (c: Pick<Collection, "ref_prefix">, item: Pick<Item, "id">) =>
  c.ref_prefix ? `${c.ref_prefix}:${item.id}` : item.id;

/** The collection prefix of a reference, or undefined for a bare id. */
export const refPrefix = (ref: string): string | undefined => {
  const at = ref.indexOf(":");
  return at > 0 ? ref.slice(0, at) : undefined;
};
