// Due-review count beside the Progress tab (DESIGN.md → Global frame). Renders nothing before
// hydration or when nothing is due.
import { useTranslations, type Lang } from "../../i18n";
import { reviewQueue, today } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";

export default function DueCount({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const due = progress ? reviewQueue(progress, today()).due.length : 0;
  if (!due) return null;
  return (
    <span className="due-count">
      <span aria-hidden="true">{due}</span>
      <span className="visually-hidden">{t("nav.due", { count: due })}</span>
    </span>
  );
}
