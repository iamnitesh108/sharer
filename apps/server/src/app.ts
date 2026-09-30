import express, { type Express } from 'express'
import type { Logger } from './lib/logger.ts'
import { createErrorHandler } from './middleware/error-handler.ts'
import { notFound } from './middleware/not-found.ts'
import { createRequestLogger } from './middleware/request-logger.ts'
import { createHealthRouter } from './modules/health/health.routes.ts'
import { createHelloRouter } from './modules/hello/hello.routes.ts'

export type AppDeps = {
  logger: Logger
}

// Kept apart from server.ts so tests can use the app without opening a port
export function createApp({ logger }: AppDeps): Express {
  const app = express()

  app.use(createRequestLogger(logger))
  app.use(express.json({ limit: '100kb' }))

  app.use('/api', createHealthRouter())
  app.use('/api', createHelloRouter())

  app.use(notFound)
  app.use(createErrorHandler(logger))

  return app
}
