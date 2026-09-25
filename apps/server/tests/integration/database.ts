import { Pool } from 'pg'

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://sharer:sharer@localhost:5432/sharer_test'

// Integration tests delete data. Refuse to run against anything that isn't
// clearly a test database, so a wrong URL can never wipe real data.
if (!new URL(TEST_DATABASE_URL).pathname.endsWith('_test')) {
  throw new Error(
    `Refusing to run integration tests: the database name in ${TEST_DATABASE_URL} must end with "_test"`,
  )
}

export function createTestPool(): Pool {
  return new Pool({ connectionString: TEST_DATABASE_URL })
}

/** Deletes all rows from the given tables. Call it before each test. */
export async function clearTables(pool: Pool, tables: string[]) {
  await pool.query(`TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`)
}
