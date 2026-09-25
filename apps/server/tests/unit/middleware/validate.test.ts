import express from 'express'
import { pino } from 'pino'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createErrorHandler } from '../../../src/middleware/error-handler.ts'
import { validate } from '../../../src/middleware/validate.ts'

function createTestApp() {
  const app = express()
  app.use(express.json())

  app.post(
    '/items/:id',
    validate({
      params: z.object({ id: z.coerce.number().int().positive() }),
      query: z.object({ draft: z.enum(['true', 'false']).default('false') }),
      body: z.object({ title: z.string().min(1) }),
    }),
    (req, res) => {
      res.json({ params: req.params, query: req.query, body: req.body })
    },
  )

  app.use(createErrorHandler(pino({ level: 'silent' })))
  return app
}

describe('validate middleware', () => {
  const app = createTestApp()

  it('passes parsed values to the handler', async () => {
    const response = await request(app)
      .post('/items/42')
      .send({ title: 'My snippet', extra: 'removed' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      params: { id: 42 },
      query: { draft: 'false' },
      body: { title: 'My snippet' },
    })
  })

  it('responds with 400 and lists every problem', async () => {
    const response = await request(app)
      .post('/items/abc?draft=maybe')
      .send({ title: '' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.details).toEqual([
      { path: 'body.title', message: expect.any(String) },
      { path: 'params.id', message: expect.any(String) },
      { path: 'query.draft', message: expect.any(String) },
    ])
  })
})
