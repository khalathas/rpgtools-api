# Project notes

## Security review — findings to tighten later (2026-09-04)

Scope of the ask: not auth-enforcement gaps (known, future work) — specifically
whether the surface itself can be abused to break out of intended API/DB
function boundaries and touch the DB or host system.

### Result
No break-out vector found in the live HTTP surface. No `eval`/`Function`/`vm`,
no shell/`child_process` exec, no deserialization of untrusted data, no SSTI,
no XXE, no arbitrary file read/write anywhere in the code. All 6 live routes
are read-only GET. Every real SQL query goes through one chokepoint,
`utils/dbUtils.js` `executeQuery()`, using the `mysql` driver's `?`/`??`
parameter binding — no string-concatenated SQL anywhere.

### To fix (small, contained, but real)
- `models/spellModel.js:22-31` `getSpellsByField`, reached via
  `GET /rules/spells/field/:field/:value`
  (`controllers/spellController.js:47-60`, route `routes/rules.js:14`).
  The column name is bound via `??` with **no allowlist** — dev already left
  a TODO at `controllers/spellController.js:50`. Not classic SQLi (node-mysql
  backtick-escapes the identifier, no query-breakout), but it lets a caller
  pick any column on `spells`, and a valid-vs-invalid column returns a
  different status code — a schema-enumeration oracle. Low impact today
  (single table, no sensitive columns), but this exact pattern would become
  a real info-disclosure/priv-esc risk if copied onto `users`
  (has `password`/`roles` per `rpgtools_schema.sql`). **Add the allowlist
  before this pattern is reused anywhere else.**

### Bigger lever than anything in the API code
`.github/workflows/deploy-dev.yml` does `git pull && npm install && pm2
restart` directly on the same bare host that runs MySQL — self-hosted
runner, no container/VM boundary, `npm install` not `npm ci` (lockfile
drift possible). This is a more direct path to full host + DB compromise
than anything reachable through the API, and it doesn't require bypassing
any auth that gets added later. Worth sandboxing (containerize the deploy,
pin/audit deps, use `npm ci`) independent of app-level auth work.

### Also noted, not urgent
- No rate limiting / no pool-exhaustion protection on any endpoint.
- Wildcard CORS (`cors()` with no options) — harmless while there's no
  session/cookie auth, becomes a real cross-origin credential-theft vector
  the moment auth is added (note: `connect-roles` is already a listed but
  unused dependency).
- `mysql@2.18.1` driver is deprecated in favor of `mysql2` (hygiene, no
  confirmed CVE found).
- No security testing of any kind exists in this repo today: no
  `security/`/`pentest/` dir, no SAST/DAST in CI, `npm test` is the default
  unimplemented stub.
