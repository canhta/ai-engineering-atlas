// The Worker's request handler. wrangler.jsonc runs the Worker first only for /api/*; every other
// path is served by static assets with `public/_headers`, and reaches this handler only when no
// asset matched, in which case it goes straight back to the assets binding (the 404 page).
//
//   GET  /api/me                          always 200: { available, user (or null), providers }
//   GET  /api/auth/{github,google}        start OAuth: state + PKCE in the session cookie, 302 to the provider
//   GET  /api/auth/{provider}/callback    verify state, exchange the code server-side, start a session
//   POST /api/auth/signout                same-origin only; ends the session and clears the cookie
import { type Env, PROVIDERS, type ProviderId, readConfig } from "./config.ts";
import { empty, isSameOrigin, json, methodNotAllowed, redirect, text } from "./http.ts";
import { type FetchLike, pkceChallenge, providers, UpstreamError } from "./oauth.ts";
import {
  clearCookie,
  createSession,
  deleteSession,
  findSession,
  hasSessionCookie,
  openPending,
  PENDING_SECONDS,
  pkceVerifier,
  randomToken,
  readCookie,
  safeEqual,
  sealPending,
  SESSION_SECONDS,
  setCookie,
  upsertUser,
} from "./session.ts";

export interface Deps {
  now: () => number;
  fetch: FetchLike;
}

const isProvider = (value: string): value is ProviderId => (PROVIDERS as readonly string[]).includes(value);

/** Where to go after sign-in: a path on this site, never another host or the API. */
export function safeReturn(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  if (value === "/api" || value.startsWith("/api/")) return "/";
  return value;
}

export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/api" && !url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

  const read = readConfig(env);
  const parts = url.pathname.split("/").slice(2); // after "/api"
  const allowed = !("missing" in read) && read.config.origins.includes(url.origin);

  // GET /api/me always answers 200, so the top bar's question on every page never logs a failed
  // request in the browser: `available: false` when sign-in cannot work here.
  if (parts.length === 1 && parts[0] === "me") {
    if (request.method !== "GET") return methodNotAllowed("GET");
    if ("missing" in read || !allowed) return json(200, { available: false });
    const { config } = read;
    const offered = PROVIDERS.filter((p) => config.providers[p]);
    const cookie = readCookie(request);
    const user = await findSession(config.db, config.secret, cookie, deps.now());
    const clear = !user && hasSessionCookie(cookie) ? clearCookie : undefined;
    return json(200, { available: true, user, providers: offered }, clear);
  }

  if ("missing" in read) {
    return json(503, {
      error: "not-configured",
      message: `Sign-in is not configured on this deployment. Missing: ${read.missing.join("; ")}.`,
    });
  }
  const { config } = read;
  if (!allowed) {
    return json(403, { error: "origin-not-allowed", message: "This origin is not in ALLOWED_ORIGINS." });
  }
  const now = deps.now();
  const cookie = readCookie(request);

  if (parts[0] !== "auth") return json(404, { error: "not-found" });

  // POST /api/auth/signout
  if (parts.length === 2 && parts[1] === "signout") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    if (!isSameOrigin(request, config.origins)) return json(403, { error: "cross-origin" });
    await deleteSession(config.db, config.secret, cookie);
    return empty(204, clearCookie);
  }

  const id = parts[1] ?? "";
  if (!isProvider(id) || parts.length > 3 || (parts.length === 3 && parts[2] !== "callback")) {
    return json(404, { error: "not-found" });
  }
  if (request.method !== "GET") return methodNotAllowed("GET");
  const credentials = config.providers[id];
  if (!credentials) return json(503, { error: "not-configured", message: `Sign-in with ${id} is not configured.` });
  const redirectUri = `${url.origin}/api/auth/${id}/callback`;

  // GET /api/auth/{provider}: start. Starting over replaces any session this browser held.
  if (parts.length === 2) {
    await deleteSession(config.db, config.secret, cookie);
    const state = randomToken();
    const pending = await sealPending(config.secret, {
      provider: id,
      state,
      returnTo: safeReturn(url.searchParams.get("return")),
      exp: now + PENDING_SECONDS * 1000,
    });
    const location = providers[id].authorizeUrl({
      clientId: credentials.clientId,
      redirectUri,
      state,
      challenge: await pkceChallenge(await pkceVerifier(config.secret, state)),
    });
    return redirect(location, setCookie(pending, PENDING_SECONDS));
  }

  // GET /api/auth/{provider}/callback
  const pending = await openPending(config.secret, cookie, now);
  if (!pending || pending.provider !== id) {
    return text(400, "Sign-in expired or did not start on this site. Go back and sign in again.", clearCookie);
  }
  const back = new URL(pending.returnTo, url.origin).toString();
  // The learner declined at the provider: go back where they were, signed out.
  if (url.searchParams.has("error")) return redirect(back, clearCookie);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  if (!code || !safeEqual(state, pending.state)) {
    return text(400, "Sign-in check failed. Go back and sign in again.", clearCookie);
  }

  let profile;
  try {
    profile = await providers[id].profile({
      credentials,
      code,
      verifier: await pkceVerifier(config.secret, pending.state),
      redirectUri,
      fetch: deps.fetch,
      now,
    });
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    // The message names the endpoint and status only; no code, token, or secret.
    console.error(`sign-in with ${id}: ${error.message}`);
    return text(502, "The sign-in provider did not confirm your account. Go back and try again.", clearCookie);
  }
  const userId = await upsertUser(config.db, id, profile.subject, profile.name, now);
  const session = await createSession(config.db, config.secret, userId, now);
  return redirect(back, setCookie(session, SESSION_SECONDS));
}
