import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/app.ts'
import { createTestLogger } from '../helpers/test-logger.ts'

function createTestApp() {
  return createApp({ logger: createTestLogger().logger })
}

describe('createApp', () => {
  it('answers GET /api/hello with the greeting as JSON', async () => {
    const response = await request(createTestApp()).get('/api/hello')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body).toEqual({ message: 'Hello from Sharer' })
  })

  it('returns a JSON 404 for an unknown route', async () => {
    const response = await request(createTestApp()).get('/api/unknown')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route GET /api/unknown not found' },
    })
  })

  it('returns 400 for a body that is not valid JSON', async () => {
    const response = await request(createTestApp())
      .post('/api/hello')
      .set('Content-Type', 'application/json')
      .send('{"name":')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Request body is not valid JSON' },
    })
  })

  it('returns 413 for a body over 100 kB', async () => {
    const response = await request(createTestApp())
      .post('/api/hello')
      .send({ text: 'x'.repeat(101 * 1024) })

    expect(response.status).toBe(413)
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })
})
