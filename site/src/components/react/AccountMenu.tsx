// Sign-in in the top bar (DESIGN.md → Global frame), a JavaScript enhancement only. It asks
// /api/me once: 401 shows "Sign in" with a menu of the providers the Worker offers; 200 shows the
// learner's name with "Sign out". Anything else (no Worker, 503 without configuration, offline)
// renders nothing. Signing in or out never touches learner progress.
import { useEffect, useState } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import { Icon } from "./Icon";

const PROVIDER_NAMES: Record<string, string> = { github: "GitHub", google: "Google" };

interface Account {
  user: { name: string } | null;
  providers: string[];
}

/**
 * Read /api/me defensively: only the two shapes the Worker sends count, the signed-in user (200)
 * and `error: "signed-out"` (401). Anything else, the 503 body included, means no sign-in here.
 */
function parse(ok: boolean, body: unknown): Account | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { user?: { name?: unknown }; error?: unknown; providers?: unknown };
  const providers = Array.isArray(b.providers)
    ? b.providers.filter((p) => typeof p === "string" && p in PROVIDER_NAMES)
    : [];
  if (ok && typeof b.user?.name === "string") return { user: { name: b.user.name }, providers };
  if (!ok && b.error === "signed-out" && providers.length) return { user: null, providers };
  return null;
}

export default function AccountMenu({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [account, setAccount] = useState<Account | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/me", { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(async (response) => parse(response.ok, await response.json()))
      .catch(() => null)
      .then((next) => {
        if (live) setAccount(next);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!account) return null;

  if (!account.user) {
    const back = encodeURIComponent(location.pathname + location.search + location.hash);
    return (
      <MenuTrigger>
        <Button className="account-trigger">
          {t("account.signIn")}
          <Icon name="expand" />
        </Button>
        <Popover className="facet-popover" placement="bottom end" offset={4}>
          {/* Named by its trigger (MenuTrigger sets aria-labelledby). */}
          <Menu className="facet-menu">
            {account.providers.map((p) => (
              <MenuItem key={p} id={p} className="facet-option" href={`/api/auth/${p}?return=${back}`}>
                {t("account.signInWith")} {PROVIDER_NAMES[p]}
              </MenuItem>
            ))}
          </Menu>
        </Popover>
      </MenuTrigger>
    );
  }

  const signOut = async () => {
    setFailed(false);
    try {
      const response = await fetch("/api/auth/signout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("sign-out refused");
      setAccount({ user: null, providers: account.providers });
    } catch {
      setFailed(true);
    }
  };

  return (
    <>
      <MenuTrigger>
        <Button className="account-trigger" aria-label={t("account.signedIn", { name: account.user.name })}>
          <span className="account-name">{account.user.name}</span>
          <Icon name="expand" />
        </Button>
        <Popover className="facet-popover" placement="bottom end" offset={4}>
          <Menu className="facet-menu">
            <MenuItem id="signout" className="facet-option" onAction={signOut}>
              {t("account.signOut")}
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      {failed && (
        <span className="account-error" role="status">
          {t("account.signOutFailed")}
        </span>
      )}
    </>
  );
}
