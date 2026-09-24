import type { ConsoleMessage } from "@playwright/test";

/**
 * A console error the test fails on. The top bar asks `/api/me` who is signed in; it answers 401
 * when signed out and 503 when the Worker has no configuration (the preview has none), and Chrome
 * logs either as "Failed to load resource". That answer is expected, so only it is exempt.
 */
export function isConsoleError(m: ConsoleMessage): boolean {
  if (m.type() !== "error") return false;
  const { url } = m.location();
  const probe = url && new URL(url).pathname === "/api/me" && m.text().startsWith("Failed to load resource");
  return !probe;
}
