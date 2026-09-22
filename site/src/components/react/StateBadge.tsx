import { useTranslations, type Lang } from "../../i18n";
import type { State } from "../../lib/progress";
import { Icon } from "./Icon";

/** Learner state as icon + text + colour; never colour alone (DESIGN.md → Progress). */
export function StateBadge({ state, lang }: { state: State; lang: Lang }) {
  const t = useTranslations(lang);
  return (
    <span className={`state-badge state-${state}`}>
      <Icon name={state} />
      {t(`state.${state}`)}
    </span>
  );
}
