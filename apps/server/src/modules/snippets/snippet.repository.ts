import { isUniqueViolation } from '../../db/errors.ts'
import type { Pool } from '../../db/pool.ts'
import { DuplicateSlugError } from './snippet.errors.ts'
import type {
  NewSnippet,
  Snippet,
  SnippetLanguage,
  UpdateSnippetInput,
} from './snippet.types.ts'

/**
 * What the service needs from storage. The service depends on this interface,
 * not on Postgres, so tests can use an in-memory version instead.
 */
export interface SnippetRepository {
  /** Throws DuplicateSlugError if the slug is already taken. */
  create(snippet: NewSnippet): Promise<Snippet>
  findBySlug(slug: string): Promise<Snippet | null>
  update(slug: string, changes: UpdateSnippetInput): Promise<Snippet | null>
}

type SnippetRow = {
  id: string
  slug: string
  content: string
  language: string
  created_at: Date
  updated_at: Date
}

const SNIPPET_COLUMNS = 'id, slug, content, language, created_at, updated_at'

export class PostgresSnippetRepository implements SnippetRepository {
  private readonly pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async create(snippet: NewSnippet): Promise<Snippet> {
    try {
      const result = await this.pool.query<SnippetRow>(
        `INSERT INTO snippets (slug, content, language)
         VALUES ($1, $2, $3)
         RETURNING ${SNIPPET_COLUMNS}`,
        [snippet.slug, snippet.content, snippet.language],
      )
      return toSnippet(result.rows[0])
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DuplicateSlugError(snippet.slug)
      }
      throw error
    }
  }

  async findBySlug(slug: string): Promise<Snippet | null> {
    const result = await this.pool.query<SnippetRow>(
      `SELECT ${SNIPPET_COLUMNS} FROM snippets WHERE slug = $1`,
      [slug],
    )
    return result.rows[0] ? toSnippet(result.rows[0]) : null
  }

  async update(
    slug: string,
    changes: UpdateSnippetInput,
  ): Promise<Snippet | null> {
    // COALESCE keeps the current value when a field isn't being changed (NULL)
    const result = await this.pool.query<SnippetRow>(
      `UPDATE snippets
       SET content    = COALESCE($2, content),
           language   = COALESCE($3, language),
           updated_at = now()
       WHERE slug = $1
       RETURNING ${SNIPPET_COLUMNS}`,
      [slug, changes.content ?? null, changes.language ?? null],
    )
    return result.rows[0] ? toSnippet(result.rows[0]) : null
  }
}

function toSnippet(row: SnippetRow): Snippet {
  return {
    id: row.id,
    slug: row.slug,
    content: row.content,
    language: row.language as SnippetLanguage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
