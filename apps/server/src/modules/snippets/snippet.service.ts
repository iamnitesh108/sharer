import { NotFoundError } from '../../errors/app-errors.ts'
import { DuplicateSlugError } from './snippet.errors.ts'
import type { SnippetRepository } from './snippet.repository.ts'
import type {
  CreateSnippetInput,
  Snippet,
  UpdateSnippetInput,
} from './snippet.types.ts'

// A clash between random 10-character slugs is extremely unlikely,
// so a few retries are plenty
const MAX_SLUG_ATTEMPTS = 3

/** Business rules for snippets. Knows nothing about HTTP or SQL. */
export class SnippetService {
  private readonly repository: SnippetRepository
  private readonly generateSlug: () => string

  constructor(repository: SnippetRepository, generateSlug: () => string) {
    this.repository = repository
    this.generateSlug = generateSlug
  }

  async createSnippet(input: CreateSnippetInput): Promise<Snippet> {
    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
      try {
        return await this.repository.create({
          ...input,
          slug: this.generateSlug(),
        })
      } catch (error) {
        if (!(error instanceof DuplicateSlugError)) throw error
      }
    }

    throw new Error(
      `Could not generate a unique slug after ${MAX_SLUG_ATTEMPTS} attempts`,
    )
  }

  async getSnippet(slug: string): Promise<Snippet> {
    const snippet = await this.repository.findBySlug(slug)

    if (!snippet) {
      throw new NotFoundError('Snippet not found')
    }

    return snippet
  }

  async updateSnippet(
    slug: string,
    changes: UpdateSnippetInput,
  ): Promise<Snippet> {
    const snippet = await this.repository.update(slug, changes)

    if (!snippet) {
      throw new NotFoundError('Snippet not found')
    }

    return snippet
  }
}
