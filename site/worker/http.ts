// Responses the API builds itself. `public/_headers` applies only to static assets, never to a
// Worker response, so every API response carries its own headers here.

const API_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

function headers(extra: Record<string, string>, cookie?: string): Headers {
  const h = new Headers({ ...API_HEADERS, ...extra });
  if (cookie) h.append("Set-Cookie", cookie);
  return h;
}

export function json(status: number, body: unknown, cookie?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: headers({ "Content-Type": "application/json; charset=utf-8" }, cookie),
  });
}

/** A plain-text answer for top-level navigations (the OAuth callback), where JSON would be unreadable. */
export function text(status: number, message: string, cookie?: string): Response {
  return new Response(`${message}\n`, {
    status,
    headers: headers({ "Content-Type": "text/plain; charset=utf-8" }, cookie),
  });
}

export function redirect(location: string, cookie?: string): Response {
  return new Response(null, { status: 302, headers: headers({ Location: location }, cookie) });
}

export function empty(status: number, cookie?: string): Response {
  return new Response(null, { status, headers: headers({}, cookie) });
}

export function methodNotAllowed(allow: string): Response {
  return new Response(JSON.stringify({ error: "method-not-allowed" }), {
    status: 405,
    headers: headers({ "Content-Type": "application/json; charset=utf-8", Allow: allow }),
  });
}

/**
 * CSRF check for state-changing requests: the Origin header must be this request's own origin,
 * and that origin must be allowed. Without an Origin header, only a browser's
 * `Sec-Fetch-Site: same-origin` is accepted.
 */
export function isSameOrigin(request: Request, allowed: string[]): boolean {
  const self = new URL(request.url).origin;
  if (!allowed.includes(self)) return false;
  const origin = request.headers.get("Origin");
  if (origin !== null) return origin === self;
  return request.headers.get("Sec-Fetch-Site") === "same-origin";
}
