import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { MAX_CONTENT_LENGTH } from '../../../../src/modules/snippets/snippet.types.ts'
import { createTestApp } from '../../../helpers/create-test-app.ts'

const SLUG_FORMAT = /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/

describe('snippets API', () => {
  describe('POST /api/snippets', () => {
    it('creates a snippet and returns it with 201', async () => {
      const response = await request(createTestApp())
        .post('/api/snippets')
        .send({ content: 'print(1)', language: 'python' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        slug: expect.stringMatching(SLUG_FORMAT),
        content: 'print(1)',
        language: 'python',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('uses defaults for missing fields', async () => {
      const response = await request(createTestApp())
        .post('/api/snippets')
        .send({})

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        content: '',
        language: 'plaintext',
      })
    })

    it('never exposes the internal id', async () => {
      const response = await request(createTestApp())
        .post('/api/snippets')
        .send({})

      expect(response.body).not.toHaveProperty('id')
    })

    it('rejects an unknown language', async () => {
      const response = await request(createTestApp())
        .post('/api/snippets')
        .send({ language: 'cobol' })

      expect(response.status).toBe(400)
      expect(response.body.error.details[0].path).toBe('body.language')
    })

    it('rejects content longer than the limit', async () => {
      const response = await request(createTestApp())
        .post('/api/snippets')
        .send({ content: 'x'.repeat(MAX_CONTENT_LENGTH + 1) })

      expect(response.status).toBe(400)
      expect(response.body.error.details[0].path).toBe('body.content')
    })
  })

  describe('GET /api/snippets/:slug', () => {
    it('returns an existing snippet', async () => {
      const app = createTestApp()
      const created = await request(app)
        .post('/api/snippets')
        .send({ content: 'hello' })

      const response = await request(app).get(
        `/api/snippets/${created.body.slug}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual(created.body)
    })

    it('responds with 404 for an unknown slug', async () => {
      const response = await request(createTestApp()).get(
        '/api/snippets/2345678923',
      )

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('responds with 400 for a malformed slug', async () => {
      const response = await request(createTestApp()).get(
        '/api/snippets/NOT-A-SLUG',
      )

      expect(response.status).toBe(400)
      expect(response.body.error.details[0].path).toBe('params.slug')
    })
  })

  describe('PATCH /api/snippets/:slug', () => {
    it('updates only the given fields', async () => {
      const app = createTestApp()
      const created = await request(app)
        .post('/api/snippets')
        .send({ content: 'old', language: 'javascript' })

      const response = await request(app)
        .patch(`/api/snippets/${created.body.slug}`)
        .send({ content: 'new' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        content: 'new',
        language: 'javascript',
      })
    })

    it('rejects an empty update', async () => {
      const app = createTestApp()
      const created = await request(app).post('/api/snippets').send({})

      const response = await request(app)
        .patch(`/api/snippets/${created.body.slug}`)
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('responds with 404 for an unknown slug', async () => {
      const response = await request(createTestApp())
        .patch('/api/snippets/2345678923')
        .send({ content: 'x' })

      expect(response.status).toBe(404)
    })
  })
})
