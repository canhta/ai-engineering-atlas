import { ICON_WEIGHT, icons, type IconName } from "../../lib/icons";

/** Decorative icon from the registry; always placed next to a text label (DESIGN.md → Icons). */
export function Icon({ name, size = 16 }: { name: IconName; size?: 16 | 20 | 24 }) {
  const Component = icons[name];
  return <Component size={size} weight={ICON_WEIGHT} aria-hidden="true" focusable="false" className="icon" />;
}
