# Owner setup: sign-in (Phase 2, slice 1)

Human steps before sign-in works on ai-eng.canhta.com. The code is on branch `phase2/01-sign-in`; nothing here has been run. Until every step is done, `/api/me` answers `{"available":false}`, the other `/api/*` endpoints answer 503, and the site works as before, so the steps can be spread over several days and deployed in any state.

Run commands from `site/`. Callback paths are fixed by the Worker: `/api/auth/github/callback` and `/api/auth/google/callback`.

## 1. GitHub OAuth apps

A GitHub OAuth app has one callback URL, so production and local development need one app each.

- [ ] Production: <https://github.com/settings/applications/new> (or the organisation's Developer settings)
  - Application name: `AI Engineering Atlas`
  - Homepage URL: `https://ai-eng.canhta.com`
  - Authorization callback URL: `https://ai-eng.canhta.com/api/auth/github/callback`
  - Enable Device Flow: off
  - After creating: note the Client ID, then "Generate a new client secret" and copy it once.
- [ ] Local development: a second app, `AI Engineering Atlas (local)`, Homepage `http://127.0.0.1:8787`, callback `http://127.0.0.1:8787/api/auth/github/callback`. GitHub accepts any port on a loopback callback, so `ATLAS_PORT` works too.

The Worker asks for no scope: GitHub shows "public data only" and returns the numeric account ID, login, and name.

## 2. Google OAuth client

In <https://console.cloud.google.com/> (a project for the atlas):

- [ ] APIs & Services → OAuth consent screen (Google Auth Platform → Branding / Audience / Data access):
  - User type: External; app name `AI Engineering Atlas`; support and developer contact email.
  - App domain: home page `https://ai-eng.canhta.com`, privacy policy `https://ai-eng.canhta.com/en/privacy/`; authorised domain `canhta.com`.
  - Scopes: `openid` and `.../auth/userinfo.profile` only (no email). Both are non-sensitive, so no verification review.
  - Audience: publish the app ("In production"); in "Testing" only listed test users can sign in.
- [ ] Credentials → Create credentials → OAuth client ID → Web application, name `ai-eng.canhta.com`
  - Authorised JavaScript origins: none needed.
  - Authorised redirect URIs:
    - `https://ai-eng.canhta.com/api/auth/google/callback`
    - `http://127.0.0.1:8787/api/auth/google/callback` (local development; if the console rejects the IP, use `http://localhost:8787/...` and open the local site on `localhost`, adding that origin to `ALLOWED_ORIGINS` in `.dev.vars`)
  - Copy the Client ID and Client secret.

## 3. D1 database

- [ ] Create it: `pnpm exec wrangler d1 create ai-engineering-atlas`
- [ ] Add the binding to `site/wrangler.jsonc` with the printed `database_id`, and replace the comment that says the binding is added later:

  ```jsonc
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ai-engineering-atlas",
      "database_id": "<printed id>",
      "migrations_dir": "worker/migrations",
    },
  ],
  ```

  Keep the ID in the file: a D1 binding without `database_id` makes `wrangler deploy` create a new database on its own.

- [ ] Apply the migrations to the remote database: `pnpm exec wrangler d1 migrations apply ai-engineering-atlas --remote` (creates `users`, `sessions`, `usage`).
- [ ] Commit the `wrangler.jsonc` change through a PR so CI is green before CD.

## 4. Worker secrets

Each `wrangler secret put` prompts for the value (nothing lands in shell history) and takes effect on the deployed Worker at once.

- [ ] `openssl rand -base64 48` and paste the result into `pnpm exec wrangler secret put SESSION_SECRET` (at least 32 characters; rotating it signs everyone out)
- [ ] `pnpm exec wrangler secret put GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (the production app)
- [ ] `pnpm exec wrangler secret put GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] `ALLOWED_ORIGINS` is already a var in `wrangler.jsonc` (`https://ai-eng.canhta.com`); change it there if the site gets another host.

A provider with only one of its two secrets is not offered; the other still works.

## 5. CI/CD

- [ ] No new GitHub secrets: the Worker's secrets live in Cloudflare, and CI tests the Worker without any.
- [ ] Check that the `CLOUDFLARE_API_TOKEN` repository secret can deploy a Worker with a D1 binding. If the first CD run after step 3 fails on the binding, edit the token in the Cloudflare dashboard and add Account → D1 → Edit.
- [ ] Merge, wait for CI, then Actions → CD → Run workflow.

## 6. Local development (optional)

- [ ] `site/.dev.vars` (git-ignored):

  ```sh
  ALLOWED_ORIGINS=http://127.0.0.1:8787
  SESSION_SECRET=<openssl rand -base64 48>
  GITHUB_CLIENT_ID=<local app>
  GITHUB_CLIENT_SECRET=<local app>
  GOOGLE_CLIENT_ID=<same client as production>
  GOOGLE_CLIENT_SECRET=<same client as production>
  ```

- [ ] `pnpm exec wrangler d1 migrations apply ai-engineering-atlas --local`
- [ ] `pnpm run build && pnpm run preview`, then open `http://127.0.0.1:8787/en/` in Chrome or Firefox (they accept the `Secure` cookie on a loopback address over plain HTTP; Safari does not).

## 7. Check production

- [ ] `curl -s https://ai-eng.canhta.com/api/me` answers `{"available":true,"user":null,"providers":["github","google"]}` with status 200.
- [ ] Sign in with GitHub and with Google from `/en/`; the top bar shows your name; Sign out returns it to "Sign in".
- [ ] `/en/privacy/` and `/vi/privacy/` load from the footer; review the Vietnamese strings listed in `site/TODO.md`.
- [ ] `node scripts/capture.mjs https://ai-eng.canhta.com prod-review "/{lang}/" "/{lang}/privacy/"` reports no problems.
- [ ] Tick "Owner setup before sign-in can go live" in `site/TODO.md`.
