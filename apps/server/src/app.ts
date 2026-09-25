import express from 'express'
import type { Logger } from './lib/logger.ts'
import { createErrorHandler } from './middleware/error-handler.ts'
import { notFound } from './middleware/not-found.ts'
import { createRequestLogger } from './middleware/request-logger.ts'
import { createHealthRouter } from './modules/health/health.routes.ts'
import { createHelloRouter } from './modules/hello/hello.routes.ts'

export type AppDependencies = {
  logger: Logger
}

export function createApp({ logger }: AppDependencies) {
  const app = express()

  // Don't advertise which framework the server runs on
  app.disable('x-powered-by')

  app.use(createRequestLogger(logger))
  app.use(express.json({ limit: '100kb' }))

  app.use('/api/health', createHealthRouter())
  app.use('/api/hello', createHelloRouter())

  // These two must stay last: first "no route matched", then turn errors into responses
  app.use(notFound)
  app.use(createErrorHandler(logger))

  return app
}
