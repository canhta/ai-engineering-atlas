# 01: Sign-in, session, and usage storage (Phase 2, slice 1)

Design: [web atlas RFC](../../../rfcs/0000-interactive-web-atlas.md) → AI support, Architecture, Phases, Defaults. Rules: `site/AGENTS.md` → AI tutor and Worker.

**What to build:** a learner can sign in with GitHub or Google and sign out; the site knows who is signed in through an HttpOnly session cookie on the site's own origin; the Worker stores a user record and usage counters in D1 and nothing else; a privacy page (en/vi) states exactly what is stored and what is sent where. No AI call is made yet: the model provider and budgets are owner decisions still open, so the AI proxy is the next slice. Browsing, diagnostics, labs, and local progress keep working signed out, and nothing about signing in changes a learner state.

**Blocked by:** None (can start immediately). Deployment is blocked on the owner creating the OAuth apps and D1 database (a guided wizard for those steps is part of this ticket's hand-off, not something the agent runs).

**Status:** ready-for-agent

- [ ] The Cloudflare Worker serves `/api/*` and passes every other path to the static assets unchanged (headers, CSP, and COOP/COEP preserved)
- [ ] `GET /api/auth/{github,google}` starts OAuth with `state` (and PKCE where supported); the callback verifies state, exchanges the code server-side, upserts the user in D1, and sets an HttpOnly, Secure, SameSite=Lax session cookie; `POST /api/auth/signout` clears it; `GET /api/me` returns the signed-in user or 401
- [ ] Sessions are opaque random IDs stored server-side (D1) with expiry; no provider tokens are kept after the exchange; CSRF: state-changing endpoints require POST with same-origin checks
- [ ] D1 schema as a migration: users (id, provider, provider subject, display name, created), sessions, usage counters (user, day, count) — no learner answers, code, or progress
- [ ] Provider credentials, session secret, and allowed origins come from Worker secrets/vars; missing configuration makes `/api/*` answer 503 with a clear message, and the site still works
- [ ] The top bar shows "Sign in" (a small menu for GitHub/Google) or the user's name with "Sign out", only as a JavaScript enhancement; with `/api` unavailable it shows nothing
- [ ] A privacy page `/{lang}/privacy/`, linked from the footer, in en and vi (VIETNAMESE_STYLE.md; owner review listed in site/TODO.md), stating: the only cookie is the session cookie; stored data is the user record and usage counters; learner answers and code will be sent to the model provider only when an AI action is used and are not stored, except messages the learner reports as wrong
- [ ] Tests: Worker unit tests for OAuth state/callback (provider HTTP mocked), session create/expire/sign-out, 503 on missing config, and routing to assets; browser tests for the signed-out top bar and the privacy page; existing suites unchanged
- [ ] `site/AGENTS.md` (Commands, AI tutor and Worker), DESIGN.md (top bar sign-in), and site/TODO.md updated in place; a `/wizard` style script or checklist for the owner's human steps (create OAuth apps with callback URLs, create D1, set secrets) is written but not run
- [ ] `pnpm run check`, `pnpm run test:e2e`, the Worker tests, and `make check` pass; nothing is deployed
