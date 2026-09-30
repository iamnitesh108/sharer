import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createRequestLogger } from '../../../src/middleware/request-logger.ts'
import { createTestLogger } from '../../helpers/test-logger.ts'

function createLoggedApp() {
  const { logger, lines } = createTestLogger()
  const app = express()
  app.use(createRequestLogger(logger))
  app.get('/ok', (_req, res) => {
    res.send('ok')
  })
  app.get('/broken', (_req, res) => {
    res.status(500).send('broken')
  })
  return { app, lines }
}

describe('createRequestLogger', () => {
  it('logs one info line per request with method, url, status and duration', async () => {
    const { app, lines } = createLoggedApp()

    await request(app).get('/ok?page=2')

    expect(lines()).toHaveLength(1)
    expect(lines()[0]).toMatchObject({
      level: 30,
      method: 'GET',
      url: '/ok?page=2',
      statusCode: 200,
      durationMs: expect.any(Number),
    })
    expect(lines()[0].msg).toMatch(/^GET \/ok\?page=2 200 \(\d+ms\)$/)
  })

  it('uses warn for 4xx and error for 5xx', async () => {
    const { app, lines } = createLoggedApp()

    await request(app).get('/missing')
    await request(app).get('/broken')

    expect(lines().map((line) => line.level)).toEqual([40, 50])
  })

  it('never logs request headers', async () => {
    const { app, lines } = createLoggedApp()

    await request(app).get('/ok').set('Authorization', 'Bearer secret-token')

    expect(JSON.stringify(lines())).not.toContain('secret-token')
  })
})
