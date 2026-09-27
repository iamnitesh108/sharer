# Sharer

Share code through a link: write or paste a snippet, get a link, send it.

Right now the app is a starting point: a React page that shows a greeting fetched from an Express API.

## Requirements

- Node.js 24 (the version is in `.nvmrc`, so `nvm use` picks it up)

## Getting started

```sh
nvm use
npm install
cp apps/server/.env.example apps/server/.env   # optional, the defaults work
```

Start the API and the web app in two terminals:

```sh
npm run dev:server   # http://localhost:3000
npm run dev:web      # http://localhost:5173
```

Open http://localhost:5173. The page should say "Hello from Sharer".

## How it fits together

```
apps/
  server/   Express 5 API, run as TypeScript directly by Node (no build step)
  web/      React 19 app, served and bundled by Vite
```

The repo is an npm workspace, so one `npm install` at the root installs both apps.

In development the browser only talks to Vite on port 5173. Vite forwards every `/api` request to the API on port 3000, so both run on one origin and no CORS setup is needed.

## Configuration

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `PORT` | server (`apps/server/.env`) | `3000` | Port the API listens on |
| `API_PROXY_TARGET` | web dev server | `http://localhost:3000` | Where Vite forwards `/api` requests |

Example: `PORT=3100 npm run dev:server` and `API_PROXY_TARGET=http://localhost:3100 npm run dev:web`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev:server` | Starts the API and restarts it when a file changes |
| `npm run dev:web` | Starts the Vite dev server with hot reload |
| `npm run typecheck` | Type-checks both apps |
| `npm run build` | Builds the web app into `apps/web/dist` |

## API

| Method | Path | Response |
|---|---|---|
| `GET` | `/api/hello` | `200` `{ "message": "Hello from Sharer" }` |
