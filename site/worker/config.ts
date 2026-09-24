// Worker bindings and configuration (site/AGENTS.md → AI tutor and Worker). Everything the API
// needs comes from Worker secrets, vars, and the D1 binding; when any of it is missing, /api/me
// answers `available: false`, every other /api/* request answers 503, and the static site is
// unaffected.

/** The subset of Cloudflare's D1 API the Worker uses. */
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

/** The static assets binding (`assets.binding` in wrangler.jsonc). */
export interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  /** Comma-separated origins the API answers on, e.g. "https://ai-eng.canhta.com". */
  ALLOWED_ORIGINS?: string;
  /** Keys the session-ID hashes and the sign-in check; at least 32 characters. */
  SESSION_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export const PROVIDERS = ["github", "google"] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export interface Credentials {
  clientId: string;
  clientSecret: string;
}

export interface Config {
  db: D1Database;
  origins: string[];
  secret: string;
  /** Only providers with both a client ID and a client secret. */
  providers: Partial<Record<ProviderId, Credentials>>;
}

export const MIN_SECRET_LENGTH = 32;

/** The configuration, or the names of what is missing (names only, never values). */
export function readConfig(env: Env): { config: Config } | { missing: string[] } {
  const missing: string[] = [];
  if (!env.DB) missing.push("DB (D1 binding)");

  const origins = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (!origins.length || !origins.every(isOrigin)) missing.push("ALLOWED_ORIGINS");

  const secret = env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) missing.push(`SESSION_SECRET (at least ${MIN_SECRET_LENGTH} characters)`);

  const providers: Config["providers"] = {};
  const pairs = {
    github: [env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET],
    google: [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET],
  } as const;
  for (const id of PROVIDERS) {
    const [clientId, clientSecret] = pairs[id];
    if (clientId && clientSecret) providers[id] = { clientId, clientSecret };
  }
  if (!Object.keys(providers).length) {
    missing.push("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET, or GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  }

  if (missing.length || !env.DB) return { missing };
  return { config: { db: env.DB, origins, secret, providers } };
}

function isOrigin(value: string): boolean {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
}
