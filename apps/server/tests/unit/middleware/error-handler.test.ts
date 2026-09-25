import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import {
  NotFoundError,
  ValidationError,
} from '../../../src/errors/app-errors.ts'
import type { Logger } from '../../../src/lib/logger.ts'
import { createErrorHandler } from '../../../src/middleware/error-handler.ts'

function createTestApp(logger: Logger) {
  const app = express()

  app.get('/not-found', () => {
    throw new NotFoundError('Snippet not found')
  })

  app.get('/invalid', () => {
    throw new ValidationError([{ path: 'body.title', message: 'Required' }])
  })

  app.get('/bug', () => {
    throw new Error('database password is hunter2')
  })

  app.get('/async-bug', async () => {
    throw new Error('something failed later')
  })

  app.use(createErrorHandler(logger))
  return app
}

function createFakeLogger() {
  return { error: vi.fn<Logger['error']>() } as unknown as Logger
}

describe('error handler', () => {
  it('sends the status and code of a known error', async () => {
    const app = createTestApp(createFakeLogger())

    const response = await request(app).get('/not-found')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Snippet not found' },
    })
  })

  it('includes details for validation errors', async () => {
    const app = createTestApp(createFakeLogger())

    const response = await request(app).get('/invalid')

    expect(response.status).toBe(400)
    expect(response.body.error.details).toEqual([
      { path: 'body.title', message: 'Required' },
    ])
  })

  it('hides unexpected errors behind a generic 500 and logs them', async () => {
    const logger = createFakeLogger()
    const app = createTestApp(logger)

    const response = await request(app).get('/bug')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    })
    expect(JSON.stringify(response.body)).not.toContain('hunter2')
    expect(logger.error).toHaveBeenCalledOnce()
  })

  it('also catches errors thrown in async handlers', async () => {
    const app = createTestApp(createFakeLogger())

    const response = await request(app).get('/async-bug')

    expect(response.status).toBe(500)
  })
})
