import { DatabaseError } from 'pg'

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = '23505'

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === UNIQUE_VIOLATION
}
