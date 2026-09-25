import { describe, expect, it } from 'vitest'
import { NotFoundError } from '../../../../src/errors/app-errors.ts'
import { SnippetService } from '../../../../src/modules/snippets/snippet.service.ts'
import { InMemorySnippetRepository } from '../../../fakes/in-memory-snippet.repository.ts'

/** Returns the given slugs one after another, so tests can control them. */
function slugsInOrder(...slugs: string[]) {
  let index = 0
  return () => slugs[index++]
}

describe('SnippetService', () => {
  describe('createSnippet', () => {
    it('creates a snippet with a generated slug', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        slugsInOrder('aaaaaaaaaa'),
      )

      const snippet = await service.createSnippet({
        content: 'print(1)',
        language: 'python',
      })

      expect(snippet).toMatchObject({
        slug: 'aaaaaaaaaa',
        content: 'print(1)',
        language: 'python',
      })
    })

    it('tries a new slug when the first one is taken', async () => {
      const repository = new InMemorySnippetRepository()
      const service = new SnippetService(
        repository,
        slugsInOrder('aaaaaaaaaa', 'aaaaaaaaaa', 'bbbbbbbbbb'),
      )
      await service.createSnippet({ content: '', language: 'plaintext' })

      const second = await service.createSnippet({
        content: '',
        language: 'plaintext',
      })

      expect(second.slug).toBe('bbbbbbbbbb')
    })

    it('gives up after three taken slugs', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        () => 'aaaaaaaaaa',
      )
      await service.createSnippet({ content: '', language: 'plaintext' })

      await expect(
        service.createSnippet({ content: '', language: 'plaintext' }),
      ).rejects.toThrow('Could not generate a unique slug')
    })
  })

  describe('getSnippet', () => {
    it('returns an existing snippet', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        slugsInOrder('aaaaaaaaaa'),
      )
      await service.createSnippet({ content: 'hello', language: 'plaintext' })

      const snippet = await service.getSnippet('aaaaaaaaaa')

      expect(snippet.content).toBe('hello')
    })

    it('throws NotFoundError for an unknown slug', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        slugsInOrder(),
      )

      await expect(service.getSnippet('zzzzzzzzzz')).rejects.toThrow(
        NotFoundError,
      )
    })
  })

  describe('updateSnippet', () => {
    it('changes only the given fields', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        slugsInOrder('aaaaaaaaaa'),
      )
      await service.createSnippet({ content: 'old', language: 'javascript' })

      const updated = await service.updateSnippet('aaaaaaaaaa', {
        content: 'new',
      })

      expect(updated).toMatchObject({ content: 'new', language: 'javascript' })
    })

    it('throws NotFoundError for an unknown slug', async () => {
      const service = new SnippetService(
        new InMemorySnippetRepository(),
        slugsInOrder(),
      )

      await expect(
        service.updateSnippet('zzzzzzzzzz', { content: 'x' }),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
