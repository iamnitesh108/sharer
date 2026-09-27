import express, { type Express } from 'express'

// Kept apart from server.ts so tests can use the app without opening a port
export function createApp(): Express {
  const app = express()

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from Sharer' })
  })

  return app
}
