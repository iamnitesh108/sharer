# Sharer

Share code and text with a link, and edit it together in real time.

> Work in progress. See [docs/ROADMAP.md](docs/ROADMAP.md) for the plan.

## Project structure

```
apps/
  server/   Express API (TypeScript, runs directly on Node)
  web/      React frontend (Vite + TypeScript)
docs/       Roadmap, dev log and decision records
```

## Requirements

- Node.js 24 or newer (there is an `.nvmrc`, so `nvm use` picks the right version)

## Getting started

```bash
nvm use
npm install
```

Start the server and the frontend together:

```bash
npm run dev
```

The API runs on http://localhost:3000 and the frontend on http://localhost:5173.

Open http://localhost:5173. The page should show "Hello from Sharer", which comes from the server.

During development, Vite forwards every `/api` request to the Express server, so the frontend and backend behave as if they were on the same origin.

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
