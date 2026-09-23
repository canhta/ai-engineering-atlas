// Atlas drawer (DESIGN.md → Atlas): why the item matters and where to start, over the dimmed
// plate. 40% wide on desktop, a full-screen sheet on mobile. Focus is trapped; Esc closes; focus
// returns to the tile or row that opened it.
import { useState } from "react";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { type State, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import type { ItemDetail } from "../../lib/summaries";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

interface Props {
  lang: Lang;
  detail: ItemDetail | null;
  /** An unknown `?item=` reference: the drawer says so instead of failing silently. */
  missing?: string | null;
  details: Record<string, ItemDetail>;
  stateLabels: Record<string, string>;
  contributeUrl: string;
  onClose: () => void;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function ItemDrawer({ lang, detail, missing, details, stateLabels, contributeUrl, onClose }: Props) {
  const t = useTranslations(lang);
  return (
    <ModalOverlay
      className="drawer-overlay"
      isDismissable
      isOpen={detail !== null || Boolean(missing)}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal className="drawer">
        <Dialog className="drawer-dialog" aria-labelledby="drawer-title">
          {detail && (
            <DrawerBody key={detail.ref} {...{ lang, detail, details, stateLabels, contributeUrl, onClose }} />
          )}
          {!detail && missing && (
            <div className="drawer-body">
              <div className="drawer-head">
                <span />
                <Button className="button-quiet drawer-close" onPress={onClose}>
                  {t("nav.close")}
                  <Icon name="close" />
                </Button>
              </div>
              <h2 id="drawer-title" className="drawer-title">
                {t("drawer.missingTitle")}
              </h2>
              <p>{t("drawer.missing", { id: missing })}</p>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function DrawerBody({ lang, detail, details, stateLabels, contributeUrl, onClose }: Props & { detail: ItemDetail }) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const [more, setMore] = useState(false);
  const state: State | null = progress && detail.href ? stateOf(progress, detail.ref) : null;

  return (
    <div className="drawer-body">
      <div className="drawer-head">
        <p className="drawer-path">
          {detail.groupLabel && <span lang={langOf(detail.groupLabel, lang)}>{detail.groupLabel.value}</span>}
          <span aria-hidden="true"> / </span>
          <span lang={langOf(detail.title, lang)}>{detail.title.value}</span>
        </p>
        <Button className="button-quiet drawer-close" onPress={onClose}>
          {t("nav.close")}
          <Icon name="close" />
        </Button>
      </div>
      <h2 id="drawer-title" className="drawer-title" lang={langOf(detail.title, lang)}>
        {detail.title.value}
      </h2>
      <ul className="chips drawer-chips">
        <li className={`chip ${detail.href ? "chip-ready" : "chip-mapped"}`}>
          <TileGlyph fill={detail.href ? "ready" : "mapped"} />
          {detail.maturity}
        </li>
        {detail.chips.map((chip, i) => (
          <li className="chip" key={i} lang={langOf(chip.label, lang)}>
            {chip.code && <code>{chip.code}</code>}
            {chip.label.value}
          </li>
        ))}
        <li className="chip chip-id">
          <code>{detail.ref}</code>
        </li>
      </ul>

      {!detail.href ? (
        <>
          <p className="drawer-mapped">{t("drawer.mapped")}</p>
          <p>
            <a href={contributeUrl}>{t("drawer.contribute")}</a>
          </p>
        </>
      ) : (
        <>
          <dl className="drawer-facts">
            <div>
              <dt>{t("log.state")}</dt>
              <dd>
                {state ? <StateBadge state={state} label={stateLabels[state]} /> : <span className="muted">…</span>}
              </dd>
            </div>
            {detail.target && (
              <div>
                <dt>{t("log.target")}</dt>
                <dd>{stateLabels[detail.target] ?? detail.target}</dd>
              </div>
            )}
          </dl>

          {detail.lead && (
            <div className="drawer-lead">
              <p className={`reading${more ? "" : " is-clamped"}`} id="drawer-lead" lang={langOf(detail.lead, lang)}>
                {detail.lead.value}
              </p>
              <Button
                className="button-quiet"
                aria-expanded={more}
                aria-controls="drawer-lead"
                onPress={() => setMore((v) => !v)}
              >
                {t(more ? "drawer.less" : "drawer.more")}
              </Button>
            </div>
          )}

          {detail.needs.length > 0 && (
            <section className="drawer-section" aria-labelledby="drawer-needs">
              <h3 id="drawer-needs">{t("map.col.needs")}</h3>
              <ul className="drawer-needs">
                {detail.needs.map((need) => {
                  const needState = progress && need.href ? stateOf(progress, need.ref) : null;
                  return (
                    <li key={need.ref}>
                      <TileGlyph fill={tileFill(Boolean(need.href), needState)} state={needState} />
                      {need.href ? (
                        <a href={need.href} lang={langOf(need.title, lang)}>
                          {need.title.value}
                        </a>
                      ) : (
                        <span lang={langOf(need.title, lang)}>{need.title.value}</span>
                      )}
                      {need.bridged && <span className="muted small">{t("prereq.bridge")}</span>}
                      {!need.href && !need.bridged && details[need.ref] && (
                        <span className="muted small">{details[need.ref].maturity}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <ul className="drawer-counts tabular">
            {detail.sources > 0 && (
              <li>{detail.sources === 1 ? t("drawer.sourceOne") : t("drawer.sources", { count: detail.sources })}</li>
            )}
            {detail.tasks > 0 && <li>{t("drawer.tasks", { count: detail.tasks })}</li>}
          </ul>
        </>
      )}

      {detail.related.length > 0 && (
        <dl className="drawer-related">
          {detail.related.map((group, i) => (
            <div key={i}>
              <dt lang={langOf(group.label, lang)}>{group.label.value}</dt>
              <dd>
                {group.items.map((item, j) => (
                  <span key={j}>
                    {j > 0 && ", "}
                    {item.href ? (
                      <a href={item.href} lang={langOf(item.title, lang)}>
                        {item.title.value}
                      </a>
                    ) : (
                      <span lang={langOf(item.title, lang)}>{item.title.value}</span>
                    )}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {detail.href && (
        <div className="drawer-actions">
          <a className="button button-primary" href={detail.href}>
            {t("drawer.open")}
          </a>
          {detail.diagnosticAnchor && (
            <a className="button-quiet" href={`${detail.href}#${detail.diagnosticAnchor}`}>
              {t("drawer.startDiagnostic")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
