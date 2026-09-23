// The plate (DESIGN.md → The plate): one tile per item of the tracked collection, grouped into
// regions by the collection's `group_by` vocabulary. Encoding is shape and fill (TileGlyph rules);
// hovering or focusing a tile on desktop draws its declared prerequisite lines from `relations`.
// Modes: overview (Home: tiles link to the Atlas drawer), explore (Atlas: filters dim, select opens
// the drawer), progress (Progress: tiles link to the Atlas drawer, mapped tiles recede).
// This folder is the only place allowed to emit SVG, and only from data.
import { type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type Lang, useTranslations } from "../../i18n";
import { type State, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import type { RegionData, TileData } from "../../lib/summaries";
import { Icon } from "../react/Icon";
import { tileFill } from "./TileGlyph";

export type PlateMode = "overview" | "explore" | "progress";

interface Props {
  lang: Lang;
  mode: PlateMode;
  regions: RegionData[];
  stateLabels: Record<string, string>;
  /** Base URL of the Atlas; overview and progress tiles link to `<atlasUrl>?item=<ref>`. */
  atlasUrl: string;
  /** Explore mode: refs that match the filters (null = all match). */
  matches?: Set<string> | null;
  selected?: string | null;
  onSelect?: (ref: string) => void;
  /** Region to bring into view on load (`?group=`). */
  focusGroup?: string | null;
  /** Heading level of region labels under the page outline. */
  regionHeading?: "h2" | "h3";
}

const BEYOND: readonly State[] = ["transferred", "retained", "applied"];
const langOf = (text: { lang: Lang }, page: Lang) => (text.lang === page ? undefined : text.lang);

interface Line {
  d: string;
  key: string;
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
}: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const hydrated = progress !== null;
  const core = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLElement>());
  const [active, setActive] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [tip, setTip] = useState<{ x: number; y: number; text: string; lang?: string } | null>(null);
  const [tabStop, setTabStop] = useState<Record<string, string>>({});
  const byRef = useMemo(
    () => new Map(regions.flatMap((r) => r.tiles.map((tile) => [tile.ref, tile] as const))),
    [regions],
  );

  // Prerequisite lines and the tooltip for the active tile (desktop widths only).
  useLayoutEffect(() => {
    const tile = active ? byRef.get(active) : undefined;
    const el = active ? tiles.current.get(active) : undefined;
    const box = core.current?.getBoundingClientRect();
    if (!tile || !el || !box || !window.matchMedia("(min-width: 1024px)").matches) {
      setLines([]);
      setTip(null);
      return;
    }
    const center = (node: HTMLElement) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    };
    const to = center(el);
    setLines(
      tile.needs.flatMap((ref) => {
        const from = tiles.current.get(ref);
        if (!from) return [];
        const a = center(from);
        const bend = Math.min(80, Math.hypot(to.x - a.x, to.y - a.y) / 3);
        return [{ key: ref, d: `M ${a.x} ${a.y} C ${a.x} ${a.y - bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}` }];
      }),
    );
    const r = el.getBoundingClientRect();
    setTip({
      x: r.left - box.left + r.width / 2,
      y: r.top - box.top,
      text: tile.title.value,
      lang: langOf(tile.title, lang),
    });
  }, [active, byRef, lang]);

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
  const onKey = (region: RegionData, index: number) => (event: KeyboardEvent<HTMLElement>) => {
    const list = region.tiles;
    let next: number;
    if (event.key === "ArrowRight") next = Math.min(index + 1, list.length - 1);
    else if (event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const here = tiles.current.get(list[index].ref)?.getBoundingClientRect();
      if (!here) return;
      const down = event.key === "ArrowDown";
      let best = -1;
      let bestScore = Infinity;
      list.forEach((candidate, i) => {
        const r = tiles.current.get(candidate.ref)?.getBoundingClientRect();
        if (!r) return;
        const dy = r.top - here.top;
        if (down ? dy <= 2 : dy >= -2) return;
        const score = Math.abs(dy) * 1000 + Math.abs(r.left - here.left);
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
    setTabStop((s) => ({ ...s, [region.value]: ref }));
    tiles.current.get(ref)?.focus();
  };

  const nameOf = (tile: TileData, state: State | null) =>
    tile.href && state
      ? t("plate.tileName", { title: tile.title.value, maturity: tile.maturity, state: stateLabels[state] })
      : t("plate.tileNameMapped", { title: tile.title.value, maturity: tile.maturity });

  const RegionHeading = regionHeading;
  const needed = new Set(active ? (byRef.get(active)?.needs ?? []) : []);

  return (
    <div className={`plate plate-${mode}`}>
      <div className="plate-core" ref={core}>
        {regions.map((region) => {
          const ready = region.tiles.filter((tile) => tile.href).length;
          const stop = tabStop[region.value] ?? region.tiles[0]?.ref;
          return (
            <section
              key={region.value}
              id={`region-${region.value}`}
              className={`plate-region${focusGroup === region.value ? " is-focus" : ""}`}
              aria-labelledby={`region-${region.value}-label`}
            >
              <RegionHeading className="plate-region-label" id={`region-${region.value}-label`}>
                <span lang={langOf(region.label, lang)}>{region.label.value}</span>
                <span className="plate-region-count tabular">
                  {t("plate.regionCount", { ready, total: region.tiles.length })}
                </span>
              </RegionHeading>
              <div className="plate-tiles">
                {region.tiles.map((tile, i) => {
                  const state = hydrated && tile.href ? stateOf(progress, tile.ref) : null;
                  const fill = tileFill(Boolean(tile.href), state);
                  const classes = [
                    "tile",
                    `tile-${fill}`,
                    state ? `tile-state-${state}` : "",
                    matches && !matches.has(tile.ref) ? "is-dim" : "",
                    selected === tile.ref ? "is-selected" : "",
                    needed.has(tile.ref) ? "is-needed" : "",
                    active === tile.ref ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const common = {
                    ref: register(tile.ref),
                    className: classes,
                    tabIndex: tile.ref === stop ? 0 : -1,
                    "aria-label": nameOf(tile, state),
                    "data-ref": tile.ref,
                    onKeyDown: onKey(region, i),
                    onFocus: () => {
                      setActive(tile.ref);
                      setTabStop((s) => (s[region.value] === tile.ref ? s : { ...s, [region.value]: tile.ref }));
                    },
                    onBlur: () => setActive((a) => (a === tile.ref ? null : a)),
                    onMouseEnter: () => setActive(tile.ref),
                    onMouseLeave: () => setActive((a) => (a === tile.ref ? null : a)),
                  };
                  // biome-ignore lint/correctness/useJsxKeyInIterable: one element inside the tile, not a list item.
                  const mark = state && BEYOND.includes(state) ? <Icon name={state} size={16} /> : null;
                  return mode === "explore" ? (
                    <button key={tile.ref} type="button" {...common} onClick={() => onSelect?.(tile.ref)}>
                      {mark}
                    </button>
                  ) : (
                    <a key={tile.ref} href={`${atlasUrl}?item=${encodeURIComponent(tile.ref)}`} {...common}>
                      {mark}
                    </a>
                  );
                })}
              </div>
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
          <span className="plate-tip" aria-hidden="true" lang={tip.lang} style={{ left: tip.x, top: tip.y }}>
            {tip.text}
          </span>
        )}
      </div>
    </div>
  );
}
