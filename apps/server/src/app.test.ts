import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.ts'

describe('GET /api/hello', () => {
  it('responds with a greeting', async () => {
    const app = createApp()

    const response = await request(app).get('/api/hello')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Hello from Sharer' })
  })
})
