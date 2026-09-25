import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../lib/logger.ts'
import type { Pool } from './pool.ts'

// For example: 001_create_snippets.sql
const MIGRATION_FILE_PATTERN = /^\d{3}_[a-z0-9_]+\.sql$/

export const MIGRATIONS_DIR = path.join(import.meta.dirname, 'migrations')

/**
 * Runs every .sql file in the migrations folder that hasn't run yet, in
 * filename order. Each migration runs in its own transaction, so a failing
 * migration leaves the database unchanged. Returns the names that were applied.
 */
export async function runMigrations(
  pool: Pool,
  logger: Logger,
  migrationsDir = MIGRATIONS_DIR,
): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const applied = await getAppliedMigrations(pool)
  const pending = (await getMigrationFiles(migrationsDir)).filter(
    (name) => !applied.has(name),
  )

  for (const name of pending) {
    const sql = await readFile(path.join(migrationsDir, name), 'utf8')
    await applyMigration(pool, name, sql)
    logger.info(`Applied migration ${name}`)
  }

  return pending
}

async function getAppliedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ name: string }>(
    'SELECT name FROM schema_migrations',
  )
  return new Set(result.rows.map((row) => row.name))
}

async function getMigrationFiles(migrationsDir: string): Promise<string[]> {
  const files = await readdir(migrationsDir)
  return files.filter((file) => MIGRATION_FILE_PATTERN.test(file)).sort()
}

async function applyMigration(pool: Pool, name: string, sql: string) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
      name,
    ])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw new Error(`Migration ${name} failed`, { cause: error })
  } finally {
    client.release()
  }
}
