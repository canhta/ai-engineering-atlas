// Cloudflare Worker entry (wrangler.jsonc → main). The handler lives in api.ts so tests can call
// it with a fake clock, fake provider HTTP, and an in-memory D1.
import { handle } from "./api.ts";
import type { Env } from "./config.ts";

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env, { now: Date.now, fetch: (input, init) => fetch(input, init) });
  },
};
