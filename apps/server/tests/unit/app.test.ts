import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createTestApp } from '../helpers/create-test-app.ts'

describe('app', () => {
  it('GET /api/health reports the server and database as up', async () => {
    const app = createTestApp()

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', database: 'up' })
  })

  it('GET /api/health responds with 503 when the database is down', async () => {
    const app = createTestApp({
      checkDatabase: async () => {
        throw new Error('connection refused')
      },
    })

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(503)
    expect(response.body).toEqual({ status: 'error', database: 'down' })
  })

  it('GET /api/hello responds with a greeting', async () => {
    const response = await request(createTestApp()).get('/api/hello')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Hello from Sharer' })
  })

  it('responds with 404 for an unknown route', async () => {
    const response = await request(createTestApp()).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/does-not-exist not found',
      },
    })
  })

  it('responds with 400 when the JSON body is malformed', async () => {
    const response = await request(createTestApp())
      .post('/api/snippets')
      .set('Content-Type', 'application/json')
      .send('{ "broken": ')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Request body is not valid JSON' },
    })
  })

  it('responds with 413 when the JSON body is larger than 200 KB', async () => {
    const response = await request(createTestApp())
      .post('/api/snippets')
      .send({ content: 'x'.repeat(201 * 1024) })

    expect(response.status).toBe(413)
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('does not reveal that it runs on Express', async () => {
    const response = await request(createTestApp()).get('/api/health')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
