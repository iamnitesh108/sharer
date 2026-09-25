# Sharer

Share code and text with a link, and edit it together in real time.

## Project structure

```
apps/
  server/   Express API (TypeScript, runs directly on Node)
  web/      React frontend (Vite + TypeScript)
```

## Requirements

- Node.js 24 or newer (there is an `.nvmrc`, so `nvm use` picks the right version)

## Getting started

```bash
nvm use
npm install
cp apps/server/.env.example apps/server/.env
```

Start the server and the frontend together:

```bash
npm run dev
```

The API runs on http://localhost:3000 and the frontend on http://localhost:5173.

Open http://localhost:5173. The page should show "Hello from Sharer", which comes from the server.

During development, Vite forwards every `/api` request to the Express server, so the frontend and backend behave as if they were on the same origin.

## Environment variables

The server reads `apps/server/.env` and checks every value at startup. If something is missing or invalid, it prints what's wrong and exits instead of starting half-configured.

| Variable    | Default       | Allowed values                                               |
| ----------- | ------------- | ------------------------------------------------------------ |
| `NODE_ENV`  | `development` | `development`, `test`, `production`                          |
| `PORT`      | `3000`        | 1–65535                                                      |
| `LOG_LEVEL` | `info`        | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |

In development the logs are colored and readable. In other environments they're JSON, one object per line.

## API

| Method | Path          | Description                                        |
| ------ | ------------- | -------------------------------------------------- |
| `GET`  | `/api/health` | Returns `{ "status": "ok" }` when the server is up |
| `GET`  | `/api/hello`  | Returns a greeting                                 |

### Errors

Every error response has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "body.title",
        "message": "Too small: expected string to have >=1 characters"
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
| 413    | `PAYLOAD_TOO_LARGE` | The request body is larger than 100 KB                   |
| 500    | `INTERNAL_ERROR`    | An unexpected error; details are only in the server logs |

## Scripts

Run these from the project root.

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Starts the API and the frontend together         |
| `npm run dev:server`   | Starts only the API (restarts when files change) |
| `npm run dev:web`      | Starts only the Vite dev server                  |
| `npm test`             | Runs the tests in every app                      |
| `npm run lint`         | Lints the whole project with oxlint              |
| `npm run format`       | Formats every file with Prettier                 |
| `npm run format:check` | Checks formatting without changing files         |
| `npm run typecheck`    | Type-checks every app                            |

Inside an app folder, `npm run test:watch` re-runs the tests as you edit.

## Continuous integration

GitHub Actions runs the format check, lint, type-check and tests on every pull request and on every push to `main`. See [.github/workflows/ci.yml](.github/workflows/ci.yml).
