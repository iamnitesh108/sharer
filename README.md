# Sharer

Share code and text with a link, and edit it together in real time.

## Project structure

```
apps/
  server/   Express API (TypeScript, runs directly on Node)
  web/      React frontend (Vite + TypeScript)
docker/     Files used by the containers in compose.yaml
```

## Requirements

- Node.js 24 or newer (there is an `.nvmrc`, so `nvm use` picks the right version)
- Podman or Docker, with Compose, to run PostgreSQL

## Getting started

```bash
nvm use
npm install
cp apps/server/.env.example apps/server/.env
```

Start PostgreSQL and create the tables:

```bash
podman compose up -d     # or: docker compose up -d
npm run db:migrate
```

The first start also creates a separate `sharer_test` database for the integration tests.

Start the server and the frontend together:

```bash
npm run dev
```

The API runs on http://localhost:3000 and the frontend on http://localhost:5173.

Open http://localhost:5173. The page should show "Hello from Sharer", which comes from the server.

During development, Vite forwards every `/api` request to the Express server, so the frontend and backend behave as if they were on the same origin.

To stop the database, run `podman compose down`. The data is kept in a volume. `podman compose down -v` deletes it too.

## Environment variables

The server reads `apps/server/.env` and checks every value at startup. If something is missing or invalid, it prints what's wrong and exits instead of starting half-configured.

| Variable       | Default       | Allowed values                                               |
| -------------- | ------------- | ------------------------------------------------------------ |
| `NODE_ENV`     | `development` | `development`, `test`, `production`                          |
| `PORT`         | `3000`        | 1–65535                                                      |
| `LOG_LEVEL`    | `info`        | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |
| `DATABASE_URL` | (required)    | A `postgres://` connection URL                               |

In development the logs are colored and readable. In other environments they're JSON, one object per line.

## Database

- Migrations are plain SQL files in `apps/server/src/db/migrations`, named `001_description.sql`, `002_...` and so on.
- `npm run db:migrate` runs the ones that haven't run yet, in order, each inside a transaction. The applied migrations are recorded in the `schema_migrations` table.
- Never edit a migration that has already run. Add a new one instead.

## API

| Method  | Path                  | Description                                                              |
| ------- | --------------------- | ------------------------------------------------------------------------ |
| `GET`   | `/api/health`         | `200` when the server and database are up, `503` if the database is down |
| `POST`  | `/api/snippets`       | Creates a snippet and returns it with `201`                              |
| `GET`   | `/api/snippets/:slug` | Returns a snippet                                                        |
| `PATCH` | `/api/snippets/:slug` | Changes a snippet's `content` and/or `language`                          |
| `GET`   | `/api/hello`          | Returns a greeting                                                       |

### Snippets

```bash
curl -X POST http://localhost:3000/api/snippets \
  -H 'Content-Type: application/json' \
  -d '{ "content": "print(\"hi\")", "language": "python" }'
```

```json
{
  "slug": "q9w9fw2mmh",
  "content": "print(\"hi\")",
  "language": "python",
  "createdAt": "2026-09-25T14:12:29.689Z",
  "updatedAt": "2026-09-25T14:12:29.689Z"
}
```

- `slug` is the snippet's public id: 10 characters, lowercase letters and digits without look-alikes (no `0`, `1`, `i`, `l`, `o`).
- `content` is optional (default `""`), up to 100,000 characters.
- `language` is optional (default `plaintext`). Allowed values: `plaintext`, `javascript`, `typescript`, `python`, `java`, `c`, `cpp`, `csharp`, `go`, `rust`, `php`, `ruby`, `html`, `css`, `json`, `yaml`, `sql`, `markdown`, `bash`.
- `PATCH` accepts either field or both, but not neither.

### Errors

Every error response has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "body.language",
        "message": "Invalid option: expected one of \"plaintext\"|\"javascript\"|..."
      }
    ]
  }
}
```

`details` is only present for validation errors.

| Status | Code                | When                                                     |
| ------ | ------------------- | -------------------------------------------------------- |
| 400    | `BAD_REQUEST`       | The request body isn't valid JSON                        |
| 400    | `VALIDATION_ERROR`  | The body, URL params or query are invalid                |
| 404    | `NOT_FOUND`         | The route or resource doesn't exist                      |
| 413    | `PAYLOAD_TOO_LARGE` | The request body is larger than 200 KB                   |
| 500    | `INTERNAL_ERROR`    | An unexpected error; details are only in the server logs |

## Scripts

Run these from the project root.

| Command                    | What it does                                              |
| -------------------------- | --------------------------------------------------------- |
| `npm run dev`              | Starts the API and the frontend together                  |
| `npm run dev:server`       | Starts only the API (restarts when files change)          |
| `npm run dev:web`          | Starts only the Vite dev server                           |
| `npm run db:migrate`       | Applies pending database migrations                       |
| `npm test`                 | Runs the unit tests in every app (no database needed)     |
| `npm run test:integration` | Runs the server's integration tests against `sharer_test` |
| `npm run lint`             | Lints the whole project with oxlint                       |
| `npm run format`           | Formats every file with Prettier                          |
| `npm run format:check`     | Checks formatting without changing files                  |
| `npm run typecheck`        | Type-checks every app                                     |

Inside an app folder, `npm run test:watch` re-runs the unit tests as you edit.

## Tests

- **Unit tests** (`apps/*/tests/unit`) are fast and need no database. The server's unit tests replace Postgres with an in-memory repository.
- **Integration tests** (`apps/server/tests/integration`) use the real `sharer_test` database. They run the migrations first and empty the tables before each test. They refuse to run against any database whose name doesn't end in `_test`. Set `TEST_DATABASE_URL` to use a different test database.

## Continuous integration

GitHub Actions runs the format check, lint, type-check, unit tests and integration tests (against a temporary PostgreSQL container) on every pull request and on every push to `main`. See [.github/workflows/ci.yml](.github/workflows/ci.yml).
