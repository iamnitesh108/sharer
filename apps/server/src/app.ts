import express, { type Express } from 'express'
import type { Logger } from './lib/logger.ts'
import { createRequestLogger } from './middleware/request-logger.ts'

export type AppDeps = {
  logger: Logger
}

// Kept apart from server.ts so tests can use the app without opening a port
export function createApp({ logger }: AppDeps): Express {
  const app = express()

  app.use(createRequestLogger(logger))

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from Sharer' })
  })

  return app
}
