// Worker tests: routing to assets, 503 without configuration, OAuth start and callback with the
// provider's HTTP mocked, and the session lifecycle against the real D1 schema (test-d1.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { type Deps, handle, safeReturn } from "./api.ts";
import type { Env } from "./config.ts";
import { pkceChallenge } from "./oauth.ts";
import { COOKIE, PENDING_SECONDS, pkceVerifier, SESSION_SECONDS } from "./session.ts";
import { memoryD1 } from "./test-d1.ts";

const ORIGIN = "https://ai-eng.canhta.com";
const T0 = Date.UTC(2026, 8, 24, 12);
const ACCESS_TOKEN = "gho_provider-access-token-never-stored";

type Call = { url: string; init?: RequestInit };

function setup(overrides: Partial<Env> = {}) {
  const db = memoryD1();
  const assetCalls: Request[] = [];
  const assetResponse = new Response("asset", { headers: { "Cross-Origin-Embedder-Policy": "require-corp" } });
  const env: Env = {
    ASSETS: {
      fetch: async (request) => {
        assetCalls.push(request);
        return assetResponse;
      },
    },
    DB: db,
    ALLOWED_ORIGINS: `${ORIGIN}, http://127.0.0.1:8787`,
    SESSION_SECRET: "s".repeat(48),
    GITHUB_CLIENT_ID: "gh-client",
    GITHUB_CLIENT_SECRET: "gh-secret",
    GOOGLE_CLIENT_ID: "google-client",
    GOOGLE_CLIENT_SECRET: "google-secret",
    ...overrides,
  };
  const calls: Call[] = [];
  let upstream: (url: string) => Response = () => new Response("unexpected", { status: 500 });
  let clock = T0;
  const deps: Deps = {
    now: () => clock,
    fetch: async (url, init) => {
      calls.push({ url, init });
      return upstream(url);
    },
  };
  const request = (path: string, init: RequestInit & { cookie?: string } = {}) => {
    const headers = new Headers(init.headers);
    if (init.cookie) headers.set("Cookie", `${COOKIE}=${init.cookie}`);
    return handle(new Request(new URL(path, ORIGIN), { ...init, headers }), env, deps);
  };
  return {
    db,
    env,
    calls,
    assetCalls,
    assetResponse,
    request,
    respond: (fn: typeof upstream) => (upstream = fn),
    advance: (ms: number) => (clock += ms),
  };
}

/** The cookie a response sets: its value and attributes. */
function cookieOf(response: Response) {
  const header = response.headers.get("Set-Cookie");
  assert.ok(header, "expected a Set-Cookie header");
  const [pair, ...attrs] = header.split("; ");
  const [name, ...value] = pair.split("=");
  assert.equal(name, COOKIE);
  return { value: value.join("="), attrs };
}

const githubUp =
  (subject = 4242, name: string | null = "Ada Lovelace") =>
  (url: string) => {
    if (url === "https://github.com/login/oauth/access_token") {
      return Response.json({ access_token: ACCESS_TOKEN, token_type: "bearer", scope: "" });
    }
    if (url === "https://api.github.com/user") return Response.json({ id: subject, login: "ada", name });
    return new Response("unexpected", { status: 500 });
  };

async function start(t: ReturnType<typeof setup>, provider = "github", returnTo = "/en/routes/ai.tool-calling/") {
  const response = await t.request(`/api/auth/${provider}?return=${encodeURIComponent(returnTo)}`);
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("Location")!);
  return { response, location, pending: cookieOf(response).value };
}

async function signIn(t: ReturnType<typeof setup>) {
  t.respond(githubUp());
  const { location, pending } = await start(t);
  const callback = await t.request(
    `/api/auth/github/callback?code=the-code&state=${location.searchParams.get("state")}`,
    { cookie: pending },
  );
  assert.equal(callback.status, 302);
  return { callback, session: cookieOf(callback).value, challenge: location.searchParams.get("code_challenge") };
}

// ------------------------------------------------------------------ routing

test("every non-API path goes to the static assets unchanged", async () => {
  const t = setup();
  for (const path of ["/", "/en/", "/vi/privacy/", "/apiary/", "/en/api/", "/pyodide/x/pyodide.mjs"]) {
    const response = await t.request(path);
    assert.equal(response, t.assetResponse, path);
  }
  assert.equal(t.assetCalls.length, 6);
});

test("API paths never reach the assets, even unconfigured", async () => {
  const t = setup({ DB: undefined });
  await t.request("/api/me");
  await t.request("/api/unknown");
  assert.equal(t.assetCalls.length, 0);
});

// ------------------------------------------------------------------ configuration

test("missing configuration answers 503 with the missing names, never values", async () => {
  const cases: [Partial<Env>, string][] = [
    [{ DB: undefined }, "DB"],
    [{ SESSION_SECRET: undefined }, "SESSION_SECRET"],
    [{ SESSION_SECRET: "too-short" }, "SESSION_SECRET"],
    [{ ALLOWED_ORIGINS: undefined }, "ALLOWED_ORIGINS"],
    [{ ALLOWED_ORIGINS: "https://ai-eng.canhta.com/path" }, "ALLOWED_ORIGINS"],
    [
      {
        GITHUB_CLIENT_ID: undefined,
        GITHUB_CLIENT_SECRET: undefined,
        GOOGLE_CLIENT_ID: "google-client",
        GOOGLE_CLIENT_SECRET: undefined,
      },
      "GITHUB_CLIENT_ID",
    ],
  ];
  for (const [overrides, name] of cases) {
    const t = setup(overrides);
    for (const path of ["/api/me", "/api/auth/github", "/api/auth/signout"]) {
      const response = await t.request(path, { method: path.endsWith("signout") ? "POST" : "GET" });
      assert.equal(response.status, 503, `${name} ${path}`);
      const body = await response.json();
      assert.equal(body.error, "not-configured");
      assert.match(body.message, new RegExp(name));
      assert.doesNotMatch(body.message, /gh-secret|google-secret|ssss/);
    }
  }
  const nothing = setup({
    DB: undefined,
    ALLOWED_ORIGINS: undefined,
    SESSION_SECRET: undefined,
    GITHUB_CLIENT_ID: undefined,
    GITHUB_CLIENT_SECRET: undefined,
    GOOGLE_CLIENT_ID: undefined,
    GOOGLE_CLIENT_SECRET: undefined,
  });
  assert.equal((await nothing.request("/api/me")).status, 503);
  assert.equal((await nothing.request("/en/")).status, 200);
});

test("a provider without both credentials is not offered, and starting it answers 503", async () => {
  const t = setup({ GOOGLE_CLIENT_SECRET: undefined });
  const me = await t.request("/api/me");
  assert.deepEqual((await me.json()).providers, ["github"]);
  assert.equal((await t.request("/api/auth/google")).status, 503);
});

test("an origin outside ALLOWED_ORIGINS is refused", async () => {
  const t = setup({ ALLOWED_ORIGINS: "https://elsewhere.example" });
  assert.equal((await t.request("/api/me")).status, 403);
});

// ------------------------------------------------------------------ OAuth start

test("starting GitHub sign-in sends state and a PKCE S256 challenge, and seals them in the session cookie", async () => {
  const t = setup();
  const { response, location, pending } = await start(t);
  assert.equal(location.origin + location.pathname, "https://github.com/login/oauth/authorize");
  assert.equal(location.searchParams.get("client_id"), "gh-client");
  assert.equal(location.searchParams.get("redirect_uri"), `${ORIGIN}/api/auth/github/callback`);
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.ok((location.searchParams.get("state") ?? "").length >= 43);
  assert.equal(location.searchParams.get("scope"), null, "no scope: public profile only");

  const { attrs } = cookieOf(response);
  assert.deepEqual(attrs, ["Path=/", `Max-Age=${PENDING_SECONDS}`, "HttpOnly", "Secure", "SameSite=Lax"]);
  assert.ok(pending.startsWith("p."));
  // The cookie carries the state but not the PKCE verifier, which is derived from the state with
  // the server's secret; only the verifier's hash went to GitHub.
  const payload = JSON.parse(Buffer.from(pending.slice(2).split(".")[0], "base64url").toString());
  assert.deepEqual(Object.keys(payload).sort(), ["exp", "provider", "returnTo", "state"]);
  assert.equal(payload.state, location.searchParams.get("state"));
  const verifier = await pkceVerifier(t.env.SESSION_SECRET!, payload.state);
  assert.equal(await pkceChallenge(verifier), location.searchParams.get("code_challenge"));
  assert.equal(t.calls.length, 0);
});

test("Google sign-in asks for openid and profile only, with PKCE", async () => {
  const t = setup();
  const { location } = await start(t, "google");
  assert.equal(location.origin, "https://accounts.google.com");
  assert.equal(location.searchParams.get("scope"), "openid profile");
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.equal(location.searchParams.get("response_type"), "code");
});

test("the return path stays on this site", () => {
  assert.equal(safeReturn("/vi/progress/?x=1"), "/vi/progress/?x=1");
  for (const bad of [null, "", "https://evil.example/", "//evil.example/", "/\\evil.example", "/api/me", "en/"]) {
    assert.equal(safeReturn(bad), "/", String(bad));
  }
});

// ------------------------------------------------------------------ OAuth callback

test("the callback exchanges the code server-side, stores the user, and starts a session", async () => {
  const t = setup();
  const { callback, session, challenge } = await signIn(t);
  assert.equal(callback.headers.get("Location"), `${ORIGIN}/en/routes/ai.tool-calling/`);
  assert.deepEqual(cookieOf(callback).attrs, [
    "Path=/",
    `Max-Age=${SESSION_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ]);
  assert.ok(session.startsWith("s."));

  const [exchange, user] = t.calls;
  const body = new URLSearchParams(String(exchange.init?.body));
  assert.equal(body.get("client_secret"), "gh-secret");
  assert.equal(body.get("code"), "the-code");
  assert.equal(body.get("redirect_uri"), `${ORIGIN}/api/auth/github/callback`);
  // The verifier sent with the code matches the challenge sent when sign-in started.
  assert.equal(await pkceChallenge(body.get("code_verifier") ?? ""), challenge);
  assert.equal(new Headers(user.init?.headers).get("Authorization"), `Bearer ${ACCESS_TOKEN}`);

  const users = t.db.sqlite.prepare("SELECT provider, provider_subject, display_name FROM users").all();
  assert.deepEqual(
    users.map((u) => ({ ...u })),
    [{ provider: "github", provider_subject: "4242", display_name: "Ada Lovelace" }],
  );
  // Opaque session: D1 holds a hash of the token, and nothing from the provider but ID and name.
  const dump = JSON.stringify([
    t.db.sqlite.prepare("SELECT * FROM users").all(),
    t.db.sqlite.prepare("SELECT * FROM sessions").all(),
  ]);
  assert.ok(!dump.includes(session.slice(2)), "the cookie token is not stored");
  assert.ok(!dump.includes(ACCESS_TOKEN), "the provider token is not stored");
  assert.ok(!dump.includes("the-code"));
});

test("signing in again keeps one user and refreshes the name", async () => {
  const t = setup();
  await signIn(t);
  t.respond(githubUp(4242, null)); // no public name: the login is used
  const { location, pending } = await start(t);
  await t.request(`/api/auth/github/callback?code=c2&state=${location.searchParams.get("state")}`, { cookie: pending });
  const users = t.db.sqlite.prepare("SELECT display_name FROM users").all();
  assert.deepEqual(
    users.map((u) => u.display_name),
    ["ada"],
  );
});

test("a wrong, missing, tampered, expired, or foreign state is refused before any provider call", async () => {
  const t = setup();
  const { location, pending } = await start(t);
  const state = location.searchParams.get("state")!;
  const [payload, signature] = pending.slice(2).split(".");
  const forged = JSON.parse(Buffer.from(payload, "base64url").toString());
  forged.state = "attacker";
  const tampered = `p.${Buffer.from(JSON.stringify(forged)).toString("base64url")}.${signature}`;

  const attempts: [string, string | undefined][] = [
    [`/api/auth/github/callback?code=c&state=wrong`, pending],
    [`/api/auth/github/callback?code=c&state=${state}`, undefined],
    [`/api/auth/github/callback?code=c&state=attacker`, tampered],
    [`/api/auth/github/callback?state=${state}`, pending],
    [`/api/auth/google/callback?code=c&state=${state}`, pending],
  ];
  for (const [path, cookie] of attempts) {
    const response = await t.request(path, { cookie });
    assert.equal(response.status, 400, path);
    assert.equal(cookieOf(response).value, "", "the check is cleared");
  }
  t.advance(PENDING_SECONDS * 1000 + 1);
  assert.equal((await t.request(`/api/auth/github/callback?code=c&state=${state}`, { cookie: pending })).status, 400);
  assert.equal(t.calls.length, 0);
  assert.equal(t.db.sqlite.prepare("SELECT count(*) AS n FROM users").get()?.n, 0);
});

test("declining at the provider returns to the page, signed out", async () => {
  const t = setup();
  const { location, pending } = await start(t, "github", "/vi/map/");
  const response = await t.request(
    `/api/auth/github/callback?error=access_denied&state=${location.searchParams.get("state")}`,
    { cookie: pending },
  );
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), `${ORIGIN}/vi/map/`);
  assert.equal(cookieOf(response).value, "");
});

test("a provider error answers 502 and stores nothing", async () => {
  const t = setup();
  t.respond(() => Response.json({ error: "bad_verification_code" }));
  const { location, pending } = await start(t);
  const original = console.error;
  const logged: string[] = [];
  console.error = (message: string) => logged.push(message);
  try {
    const response = await t.request(`/api/auth/github/callback?code=c&state=${location.searchParams.get("state")}`, {
      cookie: pending,
    });
    assert.equal(response.status, 502);
  } finally {
    console.error = original;
  }
  assert.equal(t.db.sqlite.prepare("SELECT count(*) AS n FROM users").get()?.n, 0);
  assert.equal(logged.length, 1);
  assert.doesNotMatch(logged[0], /gh-secret|c&|state/);
});

function idToken(claims: Record<string, unknown>) {
  const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  return `${part({ alg: "RS256" })}.${part(claims)}.signature`;
}

test("Google: the ID token must be for this client and unexpired", async () => {
  const good = { iss: "https://accounts.google.com", aud: "google-client", sub: "g-1", name: "Grace Hopper" };
  const cases: [Record<string, unknown>, number][] = [
    [{ ...good, exp: T0 / 1000 + 600 }, 302],
    [{ ...good, aud: "other-client", exp: T0 / 1000 + 600 }, 502],
    [{ ...good, iss: "https://evil.example", exp: T0 / 1000 + 600 }, 502],
    [{ ...good, exp: T0 / 1000 - 1 }, 502],
  ];
  const original = console.error;
  console.error = () => {};
  try {
    for (const [claims, status] of cases) {
      const t = setup();
      t.respond(() => Response.json({ access_token: "ya29.x", id_token: idToken(claims) }));
      const { location, pending } = await start(t, "google");
      const response = await t.request(`/api/auth/google/callback?code=c&state=${location.searchParams.get("state")}`, {
        cookie: pending,
      });
      assert.equal(response.status, status, JSON.stringify(claims));
      const body = new URLSearchParams(String(t.calls[0].init?.body));
      assert.equal(body.get("grant_type"), "authorization_code");
      assert.ok(body.get("code_verifier"));
      if (status === 302) {
        const users = t.db.sqlite.prepare("SELECT provider, provider_subject, display_name FROM users").all();
        assert.deepEqual(
          users.map((u) => ({ ...u })),
          [{ provider: "google", provider_subject: "g-1", display_name: "Grace Hopper" }],
        );
      }
    }
  } finally {
    console.error = original;
  }
});

// ------------------------------------------------------------------ sessions

test("/api/me returns the signed-in user, or 401 with the providers offered", async () => {
  const t = setup();
  const anonymous = await t.request("/api/me");
  assert.equal(anonymous.status, 401);
  assert.deepEqual(await anonymous.json(), { error: "signed-out", providers: ["github", "google"] });
  assert.equal(anonymous.headers.get("Cache-Control"), "no-store");

  const { session } = await signIn(t);
  const me = await t.request("/api/me", { cookie: session });
  assert.equal(me.status, 200);
  assert.deepEqual(await me.json(), {
    user: { name: "Ada Lovelace", provider: "github" },
    providers: ["github", "google"],
  });
  const forged = await t.request("/api/me", { cookie: "s.not-a-real-token" });
  assert.equal(forged.status, 401);
});

test("a session expires after 30 days and is removed", async () => {
  const t = setup();
  const { session } = await signIn(t);
  t.advance(SESSION_SECONDS * 1000 - 1);
  assert.equal((await t.request("/api/me", { cookie: session })).status, 200);
  t.advance(1);
  const expired = await t.request("/api/me", { cookie: session });
  assert.equal(expired.status, 401);
  assert.equal(cookieOf(expired).value, "");
  assert.equal(t.db.sqlite.prepare("SELECT count(*) AS n FROM sessions").get()?.n, 0);
});

test("sign-out needs a same-origin POST, deletes the session, and clears the cookie", async () => {
  const t = setup();
  const { session } = await signIn(t);

  assert.equal((await t.request("/api/auth/signout", { cookie: session })).status, 405);
  const crossSite: Record<string, string>[] = [
    { Origin: "https://evil.example" },
    {},
    { "Sec-Fetch-Site": "cross-site" },
  ];
  for (const headers of crossSite) {
    const refused = await t.request("/api/auth/signout", { method: "POST", cookie: session, headers });
    assert.equal(refused.status, 403, JSON.stringify(headers));
  }
  assert.equal((await t.request("/api/me", { cookie: session })).status, 200, "still signed in");

  const out = await t.request("/api/auth/signout", { method: "POST", cookie: session, headers: { Origin: ORIGIN } });
  assert.equal(out.status, 204);
  assert.deepEqual(cookieOf(out).attrs, ["Path=/", "Max-Age=0", "HttpOnly", "Secure", "SameSite=Lax"]);
  assert.equal(t.db.sqlite.prepare("SELECT count(*) AS n FROM sessions").get()?.n, 0);
  assert.equal((await t.request("/api/me", { cookie: session })).status, 401);

  const fetchMetadata = await t.request("/api/auth/signout", {
    method: "POST",
    headers: { "Sec-Fetch-Site": "same-origin" },
  });
  assert.equal(fetchMetadata.status, 204);
});

test("unknown API paths and methods", async () => {
  const t = setup();
  assert.equal((await t.request("/api/nothing")).status, 404);
  assert.equal((await t.request("/api/auth/facebook")).status, 404);
  assert.equal((await t.request("/api/auth/github/callback/extra")).status, 404);
  assert.equal((await t.request("/api/me", { method: "POST", headers: { Origin: ORIGIN } })).status, 405);
  assert.equal((await t.request("/api/auth/github", { method: "POST", headers: { Origin: ORIGIN } })).status, 405);
});

test("D1 holds users, sessions, and usage counters only", () => {
  const { db } = setup();
  const tables = db.sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((r) => r.name);
  assert.deepEqual(tables, ["sessions", "usage", "users"]);
  const columns = (table: string) =>
    db.sqlite
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((c) => c.name);
  assert.deepEqual(columns("users"), ["id", "provider", "provider_subject", "display_name", "created_at"]);
  assert.deepEqual(columns("sessions"), ["id", "user_id", "created_at", "expires_at"]);
  assert.deepEqual(columns("usage"), ["user_id", "day", "count"]);
});
