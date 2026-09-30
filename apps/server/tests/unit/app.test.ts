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

  it('returns 404 for an unknown route', async () => {
    const response = await request(createTestApp()).get('/api/unknown')

    expect(response.status).toBe(404)
  })
})
