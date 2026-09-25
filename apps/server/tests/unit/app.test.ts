import { pino } from 'pino'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/app.ts'

const app = createApp({ logger: pino({ level: 'silent' }) })

describe('app', () => {
  it('GET /api/health reports that the server is up', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('GET /api/hello responds with a greeting', async () => {
    const response = await request(app).get('/api/hello')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Hello from Sharer' })
  })

  it('responds with 404 for an unknown route', async () => {
    const response = await request(app).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/does-not-exist not found',
      },
    })
  })

  it('responds with 400 when the JSON body is malformed', async () => {
    const response = await request(app)
      .post('/api/hello')
      .set('Content-Type', 'application/json')
      .send('{ "broken": ')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Request body is not valid JSON' },
    })
  })

  it('responds with 413 when the JSON body is larger than 100 KB', async () => {
    const response = await request(app)
      .post('/api/hello')
      .send({ content: 'x'.repeat(101 * 1024) })

    expect(response.status).toBe(413)
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('does not reveal that it runs on Express', async () => {
    const response = await request(app).get('/api/health')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
