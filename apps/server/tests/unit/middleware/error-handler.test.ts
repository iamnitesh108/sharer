import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import {
  BadRequestError,
  NotFoundError,
} from '../../../src/errors/app-errors.ts'
import { createErrorHandler } from '../../../src/middleware/error-handler.ts'
import { createTestLogger } from '../../helpers/test-logger.ts'

function createFailingApp() {
  const { logger, lines } = createTestLogger()
  const app = express()
  app.get('/bad', () => {
    throw new BadRequestError('Name is missing')
  })
  app.get('/missing', async () => {
    throw new NotFoundError('Snippet not found')
  })
  app.get('/bug', () => {
    throw new Error('connection string postgres://user:secret@db')
  })
  app.use(createErrorHandler(logger))
  return { app, lines }
}

describe('createErrorHandler', () => {
  it('sends an AppError with its status, code and message', async () => {
    const { app } = createFailingApp()

    const response = await request(app).get('/bad')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Name is missing' },
    })
  })

  it('handles errors thrown from async handlers', async () => {
    const { app } = createFailingApp()

    const response = await request(app).get('/missing')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('hides unexpected errors behind a generic 500 and logs them', async () => {
    const { app, lines } = createFailingApp()

    const response = await request(app).get('/bug')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    })
    expect(JSON.stringify(response.body)).not.toContain('secret')
    expect(lines()).toEqual([
      expect.objectContaining({
        level: 50,
        msg: 'Unhandled error',
        url: '/bug',
        err: expect.objectContaining({
          message: 'connection string postgres://user:secret@db',
        }),
      }),
    ])
  })
})
