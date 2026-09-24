// The one cookie (RFC → Defaults: "the only cookie is the session cookie") and what it points at.
// While a sign-in is under way it holds a signed, 10-minute check (provider, OAuth state, where to
// return); after the callback it holds an opaque random session token. D1 keeps
// only an HMAC of that token, so a copy of the database cannot be replayed as a cookie.
import type { D1Database, ProviderId } from "./config.ts";

export const COOKIE = "__Host-atlas-session";
export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export const PENDING_SECONDS = 10 * 60;

const PENDING = "p.";
const SESSION = "s.";

export function setCookie(value: string, maxAge: number): string {
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export const clearCookie = setCookie("", 0);

export function readCookie(request: Request): string | null {
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return rest.join("=") || null;
  }
  return null;
}

// ------------------------------------------------------------------ encoding and keys

const encoder = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function fromBase64url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(secret: string, message: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(message)));
}

/** Constant-time string comparison for values of public length (the OAuth state). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ------------------------------------------------------------------ pending sign-in

export interface Pending {
  provider: ProviderId;
  state: string;
  returnTo: string;
  /** Expiry, epoch milliseconds. */
  exp: number;
}

/**
 * The PKCE verifier for a sign-in, derived from its state with the server's secret, so the cookie
 * never carries it: whoever sees the state or the code still cannot compute it.
 */
export async function pkceVerifier(secret: string, state: string): Promise<string> {
  return base64url(await sign(secret, `pkce:${state}`));
}

export async function sealPending(secret: string, pending: Pending): Promise<string> {
  const payload = base64url(encoder.encode(JSON.stringify(pending)));
  return `${PENDING}${payload}.${base64url(await sign(secret, `pending:${payload}`))}`;
}

export async function openPending(secret: string, value: string | null, now: number): Promise<Pending | null> {
  if (!value?.startsWith(PENDING)) return null;
  const [payload, signature, extra] = value.slice(PENDING.length).split(".");
  const sig = signature ? fromBase64url(signature) : null;
  if (!payload || !sig || extra !== undefined) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), sig, encoder.encode(`pending:${payload}`));
  if (!ok) return null;
  const bytes = fromBase64url(payload);
  if (!bytes) return null;
  const pending = JSON.parse(new TextDecoder().decode(bytes)) as Pending;
  return pending.exp > now ? pending : null;
}

// ------------------------------------------------------------------ users and sessions (D1)

async function sessionId(secret: string, token: string): Promise<string> {
  return [...(await sign(secret, `session:${token}`))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sessionToken(value: string | null): string | null {
  return value?.startsWith(SESSION) && value.length > SESSION.length ? value.slice(SESSION.length) : null;
}

export const MAX_NAME_LENGTH = 100;

/** Insert or refresh the user for this provider account; returns the internal user ID. */
export async function upsertUser(
  db: D1Database,
  provider: ProviderId,
  subject: string,
  name: string,
  now: number,
): Promise<string> {
  const row = await db
    .prepare(
      `INSERT INTO users (id, provider, provider_subject, display_name, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (provider, provider_subject) DO UPDATE SET display_name = excluded.display_name
       RETURNING id`,
    )
    .bind(crypto.randomUUID(), provider, subject, name.slice(0, MAX_NAME_LENGTH), now)
    .first<{ id: string }>();
  if (!row) throw new Error("user upsert returned no row");
  return row.id;
}

/** Start a session; returns the cookie value. Expired sessions are swept on the way. */
export async function createSession(db: D1Database, secret: string, userId: string, now: number): Promise<string> {
  const token = randomToken();
  await db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now).run();
  await db
    .prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sessionId(secret, token), userId, now, now + SESSION_SECONDS * 1000)
    .run();
  return `${SESSION}${token}`;
}

export interface SessionUser {
  name: string;
  provider: ProviderId;
}

/** The signed-in user for this cookie value, or null (no session, unknown, or expired). */
export async function findSession(
  db: D1Database,
  secret: string,
  value: string | null,
  now: number,
): Promise<SessionUser | null> {
  const token = sessionToken(value);
  if (!token) return null;
  const id = await sessionId(secret, token);
  const row = await db
    .prepare(
      `SELECT users.display_name AS name, users.provider AS provider, sessions.expires_at AS expires
       FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.id = ?`,
    )
    .bind(id)
    .first<{ name: string; provider: ProviderId; expires: number }>();
  if (!row) return null;
  if (row.expires <= now) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return null;
  }
  return { name: row.name, provider: row.provider };
}

export function hasSessionCookie(value: string | null): boolean {
  return sessionToken(value) !== null;
}

export async function deleteSession(db: D1Database, secret: string, value: string | null): Promise<void> {
  const token = sessionToken(value);
  if (token)
    await db
      .prepare("DELETE FROM sessions WHERE id = ?")
      .bind(await sessionId(secret, token))
      .run();
}
