// OAuth providers: the authorization URL (with state and a PKCE S256 challenge) and the
// server-side code exchange that yields the account's stable ID and display name. The provider's
// access token lives only inside `profile()` and is never stored or logged. Neither provider is
// asked for the email address.
import type { Credentials, ProviderId } from "./config.ts";
import { base64url, fromBase64url } from "./session.ts";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface Profile {
  subject: string;
  name: string;
}

interface Exchange {
  credentials: Credentials;
  code: string;
  verifier: string;
  redirectUri: string;
  fetch: FetchLike;
  now: number;
}

interface Provider {
  authorizeUrl(p: { clientId: string; redirectUri: string; state: string; challenge: string }): string;
  profile(p: Exchange): Promise<Profile>;
}

/** A provider answered with an error or something unexpected. The message never includes a token. */
export class UpstreamError extends Error {}

export async function pkceChallenge(verifier: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

async function readJson(response: Response, what: string): Promise<Record<string, unknown>> {
  if (!response.ok) throw new UpstreamError(`${what} answered HTTP ${response.status}`);
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new UpstreamError(`${what} did not answer JSON`);
  }
}

const form = (fields: Record<string, string>) => new URLSearchParams(fields).toString();
const FORM = "application/x-www-form-urlencoded";

const github: Provider = {
  authorizeUrl: ({ clientId, redirectUri, state, challenge }) =>
    `https://github.com/login/oauth/authorize?${form({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      // No scope: the public profile (ID, login, name) is all the atlas reads.
      allow_signup: "true",
    })}`,
  async profile({ credentials, code, verifier, redirectUri, fetch }) {
    const token = await readJson(
      await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": FORM },
        body: form({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }),
      }),
      "GitHub token endpoint",
    );
    // GitHub reports a bad code as HTTP 200 with an `error` field.
    if (typeof token.access_token !== "string") throw new UpstreamError("GitHub token endpoint returned no token");
    const user = await readJson(
      await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token.access_token}`,
          "User-Agent": "ai-engineering-atlas",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }),
      "GitHub user endpoint",
    );
    if (typeof user.id !== "number" || typeof user.login !== "string") {
      throw new UpstreamError("GitHub user endpoint returned no ID");
    }
    const name = typeof user.name === "string" && user.name.trim() ? user.name.trim() : user.login;
    return { subject: String(user.id), name };
  },
};

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const google: Provider = {
  authorizeUrl: ({ clientId, redirectUri, state, challenge }) =>
    `https://accounts.google.com/o/oauth2/v2/auth?${form({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    })}`,
  async profile({ credentials, code, verifier, redirectUri, fetch, now }) {
    const token = await readJson(
      await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": FORM },
        body: form({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code,
          code_verifier: verifier,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }),
      "Google token endpoint",
    );
    // The ID token comes straight from Google's token endpoint over TLS, so the issuer is
    // established by the connection (OpenID Connect Core 3.1.3.7, item 6); the claims are still
    // checked for this client and for expiry.
    const claims = typeof token.id_token === "string" ? decodeJwtPayload(token.id_token) : null;
    if (!claims) throw new UpstreamError("Google token endpoint returned no ID token");
    const valid =
      GOOGLE_ISSUERS.includes(String(claims.iss)) &&
      claims.aud === credentials.clientId &&
      typeof claims.exp === "number" &&
      claims.exp * 1000 > now &&
      typeof claims.sub === "string" &&
      claims.sub.length > 0;
    if (!valid) throw new UpstreamError("Google ID token failed the issuer, audience, or expiry check");
    const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : "Google";
    return { subject: claims.sub as string, name };
  },
};

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const bytes = fromBase64url(jwt.split(".")[1] ?? "");
  if (!bytes) return null;
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const providers: Record<ProviderId, Provider> = { github, google };
