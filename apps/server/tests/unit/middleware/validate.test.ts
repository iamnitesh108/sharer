import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createErrorHandler } from '../../../src/middleware/error-handler.ts'
import { validate } from '../../../src/middleware/validate.ts'
import { createTestLogger } from '../../helpers/test-logger.ts'

function createValidatedApp() {
  const app = express()
  app.use(express.json())
  app.post(
    '/items/:id',
    validate({
      params: z.object({ id: z.string().regex(/^\d+$/, 'must be a number') }),
      query: z.object({ limit: z.coerce.number().int().max(50).default(10) }),
      body: z.object({ name: z.string().min(1, 'is required') }),
    }),
    (req, res) => {
      res.json({ params: req.params, query: req.query, body: req.body })
    },
  )
  app.use(createErrorHandler(createTestLogger().logger))
  return app
}

describe('validate', () => {
  it('reports every problem in params, query and body at once', async () => {
    const response = await request(createValidatedApp())
      .post('/items/abc?limit=500')
      .send({ name: '' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request is invalid',
        details: [
          { path: 'params.id', message: 'must be a number' },
          { path: 'query.limit', message: expect.any(String) },
          { path: 'body.name', message: 'is required' },
        ],
      },
    })
  })

  it('passes the parsed values on to the handler', async () => {
    const response = await request(createValidatedApp())
      .post('/items/7?limit=20')
      .send({ name: 'notes', extra: true })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      params: { id: '7' },
      query: { limit: 20 },
      body: { name: 'notes' },
    })
  })

  it('applies schema defaults', async () => {
    const response = await request(createValidatedApp())
      .post('/items/7')
      .send({ name: 'notes' })

    expect(response.body.query).toEqual({ limit: 10 })
  })
})
