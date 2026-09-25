import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { DuplicateSlugError } from '../../../../src/modules/snippets/snippet.errors.ts'
import { PostgresSnippetRepository } from '../../../../src/modules/snippets/snippet.repository.ts'
import { clearTables, createTestPool } from '../../database.ts'

const pool = createTestPool()
const repository = new PostgresSnippetRepository(pool)

beforeEach(async () => {
  await clearTables(pool, ['snippets'])
})

afterAll(async () => {
  await pool.end()
})

describe('PostgresSnippetRepository', () => {
  it('creates a snippet and reads it back by slug', async () => {
    const created = await repository.create({
      slug: 'aaaaaaaaaa',
      content: 'print(1)',
      language: 'python',
    })

    const found = await repository.findBySlug('aaaaaaaaaa')

    expect(found).toEqual(created)
    expect(found).toMatchObject({
      slug: 'aaaaaaaaaa',
      content: 'print(1)',
      language: 'python',
    })
    expect(found?.id).toEqual(expect.any(String))
    expect(found?.createdAt).toBeInstanceOf(Date)
  })

  it('returns null for an unknown slug', async () => {
    expect(await repository.findBySlug('zzzzzzzzzz')).toBeNull()
  })

  it('throws DuplicateSlugError when the slug is taken', async () => {
    const snippet = {
      slug: 'aaaaaaaaaa',
      content: '',
      language: 'plaintext',
    } as const
    await repository.create(snippet)

    await expect(repository.create(snippet)).rejects.toThrow(DuplicateSlugError)
  })

  it('updates only the given fields and bumps updatedAt', async () => {
    const created = await repository.create({
      slug: 'aaaaaaaaaa',
      content: 'old',
      language: 'javascript',
    })

    const updated = await repository.update('aaaaaaaaaa', { content: 'new' })

    expect(updated).toMatchObject({ content: 'new', language: 'javascript' })
    expect(updated!.updatedAt.getTime()).toBeGreaterThan(
      created.updatedAt.getTime(),
    )
  })

  it('returns null when updating an unknown slug', async () => {
    expect(await repository.update('zzzzzzzzzz', { content: 'x' })).toBeNull()
  })

  it('keeps user input as data, not SQL', async () => {
    const content = "'); DROP TABLE snippets; --"

    await repository.create({ slug: 'aaaaaaaaaa', content, language: 'sql' })

    expect((await repository.findBySlug('aaaaaaaaaa'))?.content).toBe(content)
  })
})
