import { DuplicateSlugError } from '../../src/modules/snippets/snippet.errors.ts'
import type { SnippetRepository } from '../../src/modules/snippets/snippet.repository.ts'
import type {
  NewSnippet,
  Snippet,
  UpdateSnippetInput,
} from '../../src/modules/snippets/snippet.types.ts'

/** Stores snippets in a Map. Behaves like the Postgres repository for tests. */
export class InMemorySnippetRepository implements SnippetRepository {
  private readonly snippets = new Map<string, Snippet>()
  private nextId = 1

  async create(snippet: NewSnippet): Promise<Snippet> {
    if (this.snippets.has(snippet.slug)) {
      throw new DuplicateSlugError(snippet.slug)
    }

    const now = new Date()
    const created: Snippet = {
      ...snippet,
      id: String(this.nextId++),
      createdAt: now,
      updatedAt: now,
    }
    this.snippets.set(created.slug, created)
    return created
  }

  async findBySlug(slug: string): Promise<Snippet | null> {
    return this.snippets.get(slug) ?? null
  }

  async update(
    slug: string,
    changes: UpdateSnippetInput,
  ): Promise<Snippet | null> {
    const existing = this.snippets.get(slug)
    if (!existing) return null

    const updated: Snippet = {
      ...existing,
      content: changes.content ?? existing.content,
      language: changes.language ?? existing.language,
      updatedAt: new Date(),
    }
    this.snippets.set(slug, updated)
    return updated
  }
}
