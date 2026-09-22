// Where learner data lives (DESIGN.md → States): this browser, or, when storage is blocked
// (private mode), only this page session, said once where progress is shown.
import { useTranslations, type Lang } from "../../i18n";
import { useStorageAvailable } from "../../lib/progress-store";

export function StorageNote({ lang, className = "" }: { lang: Lang; className?: string }) {
  const t = useTranslations(lang);
  const available = useStorageAvailable();
  if (available === false) {
    return (
      <p className={`storage-blocked small ${className}`} role="note">
        {t("storage.blocked")}
      </p>
    );
  }
  return <p className={`small muted ${className}`}>{t("log.localNote")}</p>;
}
