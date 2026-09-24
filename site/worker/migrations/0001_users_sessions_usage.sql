-- D1 holds users, sessions, and usage counters only (web atlas RFC → AI support, Storage).
-- No learner answers, code, progress, email addresses, or provider tokens.
-- Times are epoch milliseconds.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  provider_subject TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (provider, provider_subject)
);

-- `id` is an HMAC-SHA256 of the random token in the cookie, never the token itself.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX sessions_user_id ON sessions (user_id);
CREATE INDEX sessions_expires_at ON sessions (expires_at);

-- AI requests per user per UTC day (YYYY-MM-DD); written by the AI proxy (next slice).
CREATE TABLE usage (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
