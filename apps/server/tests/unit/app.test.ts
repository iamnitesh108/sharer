import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/app.ts'

describe('createApp', () => {
  it('answers GET /api/hello with the greeting as JSON', async () => {
    const response = await request(createApp()).get('/api/hello')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body).toEqual({ message: 'Hello from Sharer' })
  })

  it('returns 404 for an unknown route', async () => {
    const response = await request(createApp()).get('/api/unknown')

    expect(response.status).toBe(404)
  })
})
