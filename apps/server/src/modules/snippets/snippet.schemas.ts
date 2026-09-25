import { z } from 'zod'
import { SLUG_PATTERN } from './snippet.slug.ts'
import { MAX_CONTENT_LENGTH, SNIPPET_LANGUAGES } from './snippet.types.ts'

const contentSchema = z.string().max(MAX_CONTENT_LENGTH)
const languageSchema = z.enum(SNIPPET_LANGUAGES)

export const createSnippetSchema = z.object({
  content: contentSchema.default(''),
  language: languageSchema.default('plaintext'),
})

export const updateSnippetSchema = z
  .object({
    content: contentSchema.optional(),
    language: languageSchema.optional(),
  })
  .refine(
    (changes) =>
      changes.content !== undefined || changes.language !== undefined,
    { message: 'Provide at least one of: content, language' },
  )

export const snippetParamsSchema = z.object({
  slug: z.string().regex(SLUG_PATTERN, 'Invalid snippet id'),
})
