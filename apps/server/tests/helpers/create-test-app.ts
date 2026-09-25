import { pino } from 'pino'
import { createApp, type AppDependencies } from '../../src/app.ts'
import { SnippetService } from '../../src/modules/snippets/snippet.service.ts'
import { generateSlug } from '../../src/modules/snippets/snippet.slug.ts'
import { InMemorySnippetRepository } from '../fakes/in-memory-snippet.repository.ts'

/**
 * Builds the real app with test doubles: a silent logger, an in-memory
 * repository and a database check that always passes. Pass overrides to
 * replace any of them.
 */
export function createTestApp(overrides: Partial<AppDependencies> = {}) {
  return createApp({
    logger: pino({ level: 'silent' }),
    snippetService: new SnippetService(
      new InMemorySnippetRepository(),
      generateSlug,
    ),
    checkDatabase: async () => {},
    ...overrides,
  })
}
