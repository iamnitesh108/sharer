export const SNIPPET_LANGUAGES = [
  'plaintext',
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'html',
  'css',
  'json',
  'yaml',
  'sql',
  'markdown',
  'bash',
] as const

export type SnippetLanguage = (typeof SNIPPET_LANGUAGES)[number]

// Keep in sync with the CHECK constraint in 001_create_snippets.sql
export const MAX_CONTENT_LENGTH = 100_000

export type Snippet = {
  id: string
  slug: string
  content: string
  language: SnippetLanguage
  createdAt: Date
  updatedAt: Date
}

export type CreateSnippetInput = {
  content: string
  language: SnippetLanguage
}

export type UpdateSnippetInput = Partial<CreateSnippetInput>

export type NewSnippet = CreateSnippetInput & { slug: string }
