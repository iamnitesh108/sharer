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

Run the server and the frontend in two terminals:

```bash
npm run dev:server   # http://localhost:3000
npm run dev:web      # http://localhost:5173
```

Open http://localhost:5173. The page should show "Hello from Sharer", which comes from the server.

During development, Vite forwards every `/api` request to the Express server, so the frontend and backend behave as if they were on the same origin.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev:server` | Starts the API and restarts it when files change |
| `npm run dev:web` | Starts the Vite dev server |
| `npm run typecheck` | Type-checks the server and builds the frontend |
