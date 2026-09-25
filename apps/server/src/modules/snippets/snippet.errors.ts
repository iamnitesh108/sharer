/** Thrown by a repository when a slug is already taken. */
export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already taken`)
    this.name = 'DuplicateSlugError'
  }
}
