# axiom-core

The Axiom Platform's core REST API. Source of truth for all D&D 3.5e rules data, user management, and platform services. Private/personal use — database content is not distributed. The API itself will be made freely available once stable.

> OGL note: The database contains content from owned physical books. A separate SRD-only database will be created for open distribution.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MariaDB |
| Auth | Auth0 JWT via `@axiom/aegis` (local package) |
| Process manager | PM2 (app name: `axiom`) |

---

## Getting Started

```bash
npm install
node app.js          # default port 4000
npm start            # alias
PORT=3000 node app.js  # custom port
```

On first run, `config.js` will prompt for database credentials and write a `config.json` (git-ignored). In dev, a `.env` file with remote DB credentials takes precedence over `config.json`.

---

## Project Structure

```
axiom-core/
├── app.js                  # Entry point — bootstraps config, DB pool, routes
├── config/
│   ├── config.js           # Config loader (config.json or .env)
│   └── database.js         # MySQL connection pool factory
├── routes/
│   ├── rules.js            # /rules — spells, feats, classes, skills, sourcebooks
│   ├── admin.js            # /admin — user management (auth required, Admin+)
│   └── system.js           # /api — health check
├── controllers/            # Request handling; calls models, returns responses
├── models/                 # SQL queries per resource
├── services/
│   └── auth0Management.js  # Auth0 Management API client (M2M)
├── utils/
│   ├── dbUtils.js          # executeQuery, successResponse, errorResponse
│   └── logger.js           # log(filename, message)
├── scripts/
│   └── backfill-user-roles.js  # One-time: assign User role to roleless accounts
└── devnotes/               # Architecture decisions, design docs (local reference)
```

---

## API Routes

### Rules — `/rules`

| Method | Path | Description |
|---|---|---|
| GET | `/rules/spells` | Paginated spell list with filters |
| GET | `/rules/spells/facets` | Distinct values for all spell filter fields |
| GET | `/rules/spells/:id` | Single spell (full record including description) |
| GET | `/rules/spells/field/:field/:value` | Spells by arbitrary field match |
| GET | `/rules/feats` | Paginated feat list with filters |
| GET | `/rules/feats/facets` | Distinct values for all feat filter fields |
| GET | `/rules/feats/:id` | Single feat |
| GET | `/rules/feats/type/:type` | Feats by type |
| POST | `/rules/feats` | Create feat |
| PATCH | `/rules/feats/:id` | Update feat |
| DELETE | `/rules/feats/:id` | Delete feat |
| POST | `/rules/feats/:id/prereqs` | Add prerequisite |
| PATCH | `/rules/feats/:id/prereqs/:prereqId` | Update prerequisite |
| DELETE | `/rules/feats/:id/prereqs/:prereqId` | Delete prerequisite |
| GET | `/rules/classes` | All classes |
| GET | `/rules/classes/book/:bookId` | Classes by source book |
| GET | `/rules/skills` | All skills |
| GET | `/rules/skills/:id` | Single skill |
| GET | `/rules/sourcebooks` | All source books |
| GET | `/rules/sourcebooks/:id` | Single source book |

**Pagination query params** (spells and feats):
- `page` — page number (default: 1)
- `page_size` — results per page (default: 50, max: 100)

**Spell filters** (all query string): `name` (LIKE), `school` (=), `subschool` (=), `components` (LIKE), `cast_time` (LIKE), `range` (LIKE), `target` (LIKE), `area` (LIKE), `effect` (LIKE), `duration` (LIKE), `saving_throw` (LIKE), `spell_resist` (LIKE)

**Feat filters**: `name` (LIKE), `feat_type` (=), `source_book_id` (=)

### Admin — `/admin`

All routes require a valid Auth0 JWT with minimum `Admin` role.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin+ | List all Auth0 users with roles |
| POST | `/admin/users/:userId/roles` | Owner only | Assign role to user |
| DELETE | `/admin/users/:userId/roles/:role` | Owner only | Remove role from user |

### System — `/api`

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check — DB connectivity + uptime |

---

## Response Format

All endpoints return a consistent envelope (ADR-026):

```json
{ "success": true, "data": { ... }, "meta": { ... } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

Paginated list responses include:

```json
{
  "meta": {
    "count": 50,
    "page": 1,
    "page_size": 50,
    "total_count": 3225,
    "total_pages": 65
  }
}
```

---

## Auth & Roles

Auth is handled by `@axiom/aegis` (local package at `../aegis`). JWT validation uses Auth0.

| Role | Level | Access |
|---|---|---|
| Owner | 3 | Full access including role assignment/removal |
| Admin | 2 | Admin routes; cannot assign/remove roles |
| User | 1 | Authenticated; no elevated permissions |

Roles are carried in the Auth0 JWT under the `https://axiom.arcanagaming.com/roles` claim. New users are automatically assigned the `User` role on first login via the Post Login Auth0 Action.

---

## Configuration

**`config.json`** (git-ignored, auto-generated on first run):
Used by the running API process. Contains DB host, user, password, database name. Intentionally distributable — does not use environment variable injection.

**`.env`** (git-ignored):
Used in dev for remote DB access. Takes precedence over `config.json`. Also provides `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, and Auth0 Management API credentials.

---

## Database

- **Engine:** MariaDB
- **Database:** `rpgtools`
- **Host:** Configured via `config.json` or `.env` — not hardcoded
- **Schema:** `rpgtools_schema.sql` (note: may be stale vs. live DB; live DB is authoritative)
- **Migrations:** Direct SQL on the live DB during active development. Knex tooling is in place (`migrations/`, `knexfile.js`) but not yet in active use — deferred until schema reaches v1 stability.

---

## Deployment

axiom-core runs under PM2+systemd on a Linux server.

```bash
pm2 list
pm2 restart axiom
pm2 logs axiom
pm2 logs axiom --lines 50
```

GitHub Actions deploys automatically on push to the active development branch. To deploy manually:

```bash
ssh your-server
cd ~/development/axiom/axiom-core
git pull
npm install      # if dependencies changed
pm2 restart axiom
```

---

## Coding Standards

- `const`/`let` only — no `var`
- `async`/`await` preferred; use `Promise.all()` where parallel execution is needed
- Parameterized queries only — never string concatenation in SQL
- `snake_case` for all DB columns; avoid MySQL reserved words
- RESTful endpoints: plural nouns, lowercase, hyphens
- Use `executeQuery()`, `successResponse()`, `errorResponse()` from `utils/dbUtils.js` — never raw mysql calls
- Use `log(filename, message)` from `utils/logger.js` — never bare `console.log`

---

## Scripts

```bash
# Assign User role to any Auth0 accounts that have no roles (run from axiom-core/ root)
node scripts/backfill-user-roles.js --dry-run
node scripts/backfill-user-roles.js
```
