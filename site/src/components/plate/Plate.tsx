// The plate (DESIGN.md → The plate): the tracked collection's items grouped into regions by its
// `group_by` vocabulary, inside a printed plate frame. Items with a page are named route tiles,
// filled and marked by the learner's state (TileGlyph rules); items without one are small circle
// marks after them. Region placement comes from src/lib/plate-layout.ts. Hovering or focusing a
// tile on desktop draws its declared prerequisite lines from `relations`; at rest none are drawn.
// Modes: overview (Home: tiles link to the Atlas drawer), explore (Atlas: filters dim, select
// opens the drawer), locator (a route page's margin: one region as compact marks, the current
// route filled, its prerequisites ringed, every mark named by a tooltip). This folder is the only
// place allowed to emit SVG, and only from data.
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Lang, useTranslations } from "../../i18n";
import { MEDIUM, placeRegions, WIDE } from "../../lib/plate-layout";
import { type State, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import type { RegionData, TileData } from "../../lib/summaries";
import { Icon } from "../react/Icon";
import { TileGlyph, tileFill } from "./TileGlyph";

export type PlateMode = "overview" | "explore" | "locator";

interface Props {
  lang: Lang;
  mode: PlateMode;
  regions: RegionData[];
  stateLabels: Record<string, string>;
  /** Base URL of the Atlas; overview tiles link to `<atlasUrl>?item=<ref>`. */
  atlasUrl: string;
  /** Explore mode: refs that match the filters (null = all match). */
  matches?: Set<string> | null;
  selected?: string | null;
  onSelect?: (ref: string) => void;
  /** Region to bring into view on load (`?group=`). */
  focusGroup?: string | null;
  /** Heading level of region labels under the page outline. */
  regionHeading?: "h2" | "h3";
  /** Locator mode: the route whose page this is; its prerequisites are ringed. */
  current?: string;
}

const BEYOND: readonly State[] = ["transferred", "retained", "applied"];
/** Prerequisite lines and the mark tooltip exist only at desktop widths (DESIGN.md → The plate). */
const DESKTOP = "(min-width: 1024px)";
const langOf = (text: { lang: Lang }, page: Lang) => (text.lang === page ? undefined : text.lang);

interface Line {
  d: string;
  key: string;
}

/** Route tiles first, then the region's mapped marks, each in content order: the reading and arrow-key order. */
const orderOf = (region: RegionData) => [
  ...region.tiles.filter((tile) => tile.href),
  ...region.tiles.filter((tile) => !tile.href),
];

/** A curve from the facing edge of one tile to the facing edge of another. */
function linePath(a: DOMRect, b: DOMRect, box: DOMRect): string {
  const ax = a.left - box.left + a.width / 2;
  const ay = a.top - box.top + a.height / 2;
  const bx = b.left - box.left + b.width / 2;
  const by = b.top - box.top + b.height / 2;
  if (Math.abs(bx - ax) > Math.abs(by - ay)) {
    const dir = Math.sign(bx - ax);
    const [sx, ex] = [ax + (dir * a.width) / 2, bx - (dir * b.width) / 2];
    const bend = Math.min(90, Math.abs(ex - sx) / 2.5);
    return `M ${sx} ${ay} C ${sx + dir * bend} ${ay}, ${ex - dir * bend} ${by}, ${ex} ${by}`;
  }
  const dir = Math.sign(by - ay) || 1;
  const [sy, ey] = [ay + (dir * a.height) / 2, by - (dir * b.height) / 2];
  const bend = Math.min(90, Math.abs(ey - sy) / 2.5);
  return `M ${ax} ${sy} C ${ax} ${sy + dir * bend}, ${bx} ${ey - dir * bend}, ${bx} ${ey}`;
}

export default function Plate({
  lang,
  mode,
  regions,
  stateLabels,
  atlasUrl,
  matches = null,
  selected = null,
  onSelect,
  focusGroup,
  regionHeading = "h2",
  current,
}: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const hydrated = progress !== null;
  const core = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLElement>());
  const [active, setActive] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [tip, setTip] = useState<{ x: number; y: number; text: string; lang?: string } | null>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const locator = mode === "locator";
  const [tabStop, setTabStop] = useState<Record<string, string>>({});
  const byRef = useMemo(
    () => new Map(regions.flatMap((r) => r.tiles.map((tile) => [tile.ref, tile] as const))),
    [regions],
  );
  const ordered = useMemo(() => regions.map(orderOf), [regions]);
  /** Locator mode: what the current route needs, ringed at rest (hover lines come on top). */
  const prereqs = useMemo(() => new Set(current ? (byRef.get(current)?.needs ?? []) : []), [byRef, current]);

  // Region placement at each width with a grid; below 768 regions stack (CSS).
  const placement = useMemo(() => {
    const shapes = regions.map((r) => ({
      id: r.value,
      ready: r.tiles.filter((tile) => tile.href).length,
      mapped: r.tiles.filter((tile) => !tile.href).length,
    }));
    const wide = new Map(placeRegions(shapes, WIDE).map((p) => [p.id, p]));
    const medium = new Map(placeRegions(shapes, MEDIUM).map((p) => [p.id, p]));
    return (id: string) => {
      const w = wide.get(id)!;
      const m = medium.get(id)!;
      return {
        "--wide-row": w.row,
        "--wide-column": w.column,
        "--wide-span": w.span,
        "--medium-row": m.row,
        "--medium-column": m.column,
        "--medium-span": m.span,
      } as CSSProperties;
    };
  }, [regions]);

  // Prerequisite lines of the active tile, and the name of an active mark (desktop widths only).
  useLayoutEffect(() => {
    const tile = active ? byRef.get(active) : undefined;
    const el = active ? tiles.current.get(active) : undefined;
    const box = core.current?.getBoundingClientRect();
    if (!tile || !el || !box || !window.matchMedia(DESKTOP).matches) {
      setLines([]);
      setTip(null);
      return;
    }
    const to = el.getBoundingClientRect();
    setLines(
      tile.needs.flatMap((ref) => {
        const from = tiles.current.get(ref);
        return from ? [{ key: ref, d: linePath(from.getBoundingClientRect(), to, box) }] : [];
      }),
    );
    setTip(
      tile.href && !locator
        ? null
        : {
            x: to.left - box.left + to.width / 2,
            y: to.top - box.top,
            text: tile.title.value,
            lang: langOf(tile.title, lang),
          },
    );
  }, [active, byRef, lang, locator]);

  // Keep the tooltip inside the plate: a narrow plate (locator) would clip a centred tip.
  useLayoutEffect(() => {
    const el = tipRef.current;
    const width = core.current?.clientWidth;
    if (!tip || !el || !width) return;
    const half = el.offsetWidth / 2;
    el.style.left = `${Math.min(Math.max(tip.x, half), Math.max(half, width - half))}px`;
  }, [tip]);

  // `?group=`: bring the region into view once.
  useEffect(() => {
    if (!focusGroup) return;
    document.getElementById(`region-${focusGroup}`)?.scrollIntoView({ block: "center" });
  }, [focusGroup]);

  const register = useCallback(
    (ref: string) => (el: HTMLElement | null) => {
      if (el) tiles.current.set(ref, el);
      else tiles.current.delete(ref);
    },
    [],
  );

  // Arrow keys move within a region (Tab moves between regions: one tab stop each).
  const onKey = (region: string, list: TileData[], index: number) => (event: KeyboardEvent<HTMLElement>) => {
    let next: number;
    if (event.key === "ArrowRight") next = Math.min(index + 1, list.length - 1);
    else if (event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const here = tiles.current.get(list[index].ref)?.getBoundingClientRect();
      if (!here) return;
      const down = event.key === "ArrowDown";
      const middle = here.left + here.width / 2;
      let best = -1;
      let bestScore = Infinity;
      list.forEach((candidate, i) => {
        const r = tiles.current.get(candidate.ref)?.getBoundingClientRect();
        if (!r) return;
        const dy = r.top - here.top;
        if (down ? dy <= 2 : dy >= -2) return;
        const score = Math.abs(dy) * 1000 + Math.abs(r.left + r.width / 2 - middle);
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      });
      next = best;
    } else return;
    event.preventDefault();
    if (next < 0 || next === index) return;
    const ref = list[next].ref;
    setTabStop((s) => ({ ...s, [region]: ref }));
    tiles.current.get(ref)?.focus();
  };

  const nameOf = (tile: TileData, state: State | null) => {
    const name =
      tile.href && state
        ? t("plate.tileName", { title: tile.title.value, maturity: tile.maturity, state: stateLabels[state] })
        : t("plate.tileNameMapped", { title: tile.title.value, maturity: tile.maturity });
    if (tile.ref === current) return t("plate.tileHere", { name });
    return prereqs.has(tile.ref) ? t("plate.tilePrereq", { name }) : name;
  };

  const RegionHeading = regionHeading;
  const needed = new Set(active ? (byRef.get(active)?.needs ?? []) : []);

  const renderTile = (region: string, list: TileData[], i: number, stop: string | undefined) => {
    const tile = list[i];
    const route = Boolean(tile.href);
    const state = hydrated && route ? stateOf(progress, tile.ref) : null;
    const classes = [
      "tile",
      route ? "tile-route" : "tile-mark",
      matches && !matches.has(tile.ref) ? "is-dim" : "",
      selected === tile.ref ? "is-selected" : "",
      needed.has(tile.ref) ? "is-needed" : "",
      active === tile.ref ? "is-active" : "",
      tile.ref === current ? "is-here" : "",
      prereqs.has(tile.ref) ? "is-prereq" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const props = {
      ref: register(tile.ref),
      className: classes,
      tabIndex: tile.ref === stop ? 0 : -1,
      "aria-label": nameOf(tile, state),
      "data-ref": tile.ref,
      "data-state": state && state !== "unassessed" && !locator ? state : undefined,
      "aria-current": tile.ref === current ? ("page" as const) : undefined,
      onKeyDown: onKey(region, list, i),
      onFocus: () => {
        setActive(tile.ref);
        setTabStop((s) => (s[region] === tile.ref ? s : { ...s, [region]: tile.ref }));
      },
      onBlur: () => setActive((a) => (a === tile.ref ? null : a)),
      onMouseEnter: () => setActive(tile.ref),
      onMouseLeave: () => setActive((a) => (a === tile.ref ? null : a)),
    };
    // Locator marks are compact: a small rectangle for a route, the circle for a mapped item.
    const body = locator ? (
      <span className={route ? "tile-box" : "tile-dot"} aria-hidden="true" />
    ) : route ? (
      <>
        {/* Unassessed: the ink rectangle alone (an empty square inside would read as a checkbox). */}
        {state && state !== "unassessed" && <TileGlyph fill={tileFill(true, state)} state={state} />}
        {state && BEYOND.includes(state) && <Icon name={state} />}
        <span className="tile-title" lang={langOf(tile.title, lang)}>
          {tile.title.value}
        </span>
      </>
    ) : (
      <span className="tile-dot" aria-hidden="true" />
    );
    return (
      <li key={tile.ref}>
        {mode === "explore" ? (
          <button type="button" {...props} onClick={() => onSelect?.(tile.ref)}>
            {body}
          </button>
        ) : (
          <a href={(locator && tile.href) || `${atlasUrl}?item=${encodeURIComponent(tile.ref)}`} {...props}>
            {body}
          </a>
        )}
      </li>
    );
  };

  return (
    <div className={`plate plate-${mode}`}>
      <div className="plate-core" ref={core}>
        {regions.map((region, r) => {
          const list = ordered[r];
          const ready = list.filter((tile) => tile.href).length;
          const stop = tabStop[region.value] ?? (list.some((tile) => tile.ref === current) ? current : list[0]?.ref);
          const indexes = list.map((_, i) => i);
          return (
            <section
              key={region.value}
              id={`region-${region.value}`}
              className={`plate-region${ready ? " has-routes" : ""}${focusGroup === region.value ? " is-focus" : ""}`}
              style={locator ? undefined : placement(region.value)}
              aria-labelledby={`region-${region.value}-label`}
            >
              <RegionHeading className="plate-region-label" id={`region-${region.value}-label`}>
                <span className="plate-region-name" lang={langOf(region.label, lang)}>
                  {region.label.value}
                </span>{" "}
                <span className="plate-region-count tabular">
                  {t("plate.regionCount", { ready, total: list.length })}
                </span>
              </RegionHeading>
              {ready > 0 && (
                <ul className="plate-routes">
                  {indexes.slice(0, ready).map((i) => renderTile(region.value, list, i, stop))}
                </ul>
              )}
              {ready < list.length && (
                <ul className="plate-marks">
                  {indexes.slice(ready).map((i) => renderTile(region.value, list, i, stop))}
                </ul>
              )}
            </section>
          );
        })}
        {lines.length > 0 && (
          <svg className="plate-lines" aria-hidden="true" focusable="false">
            {lines.map((line) => (
              <path key={line.key} d={line.d} />
            ))}
          </svg>
        )}
        {tip && (
          <span
            ref={tipRef}
            className="plate-tip"
            aria-hidden="true"
            lang={tip.lang}
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.text}
          </span>
        )}
      </div>
    </div>
  );
}
