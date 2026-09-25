import { pino } from 'pino'
import { runMigrations } from '../../src/db/migrator.ts'
import { createTestPool } from './database.ts'

/** Runs once before all integration tests: brings the test database schema up to date. */
export default async function setup() {
  const pool = createTestPool()

  try {
    await runMigrations(pool, pino({ level: 'silent' }))
  } finally {
    await pool.end()
  }
}
