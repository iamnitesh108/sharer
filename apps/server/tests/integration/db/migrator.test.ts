import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pino } from 'pino'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../../../src/db/migrator.ts'
import { createTestPool } from '../database.ts'

const pool = createTestPool()
const logger = pino({ level: 'silent' })
let migrationsDir: string

// Names that can't clash with the real migrations
const FIRST = '901_create_migrator_test_a.sql'
const SECOND = '902_create_migrator_test_b.sql'
const BROKEN = '903_broken.sql'

beforeEach(async () => {
  migrationsDir = await mkdtemp(path.join(tmpdir(), 'sharer-migrations-'))
})

afterEach(async () => {
  await pool.query('DROP TABLE IF EXISTS migrator_test_a, migrator_test_b')
  await pool.query('DELETE FROM schema_migrations WHERE name = ANY($1)', [
    [FIRST, SECOND, BROKEN],
  ])
  await rm(migrationsDir, { recursive: true })
})

afterAll(async () => {
  await pool.end()
})

async function addMigration(name: string, sql: string) {
  await writeFile(path.join(migrationsDir, name), sql)
}

async function tableExists(name: string): Promise<boolean> {
  const result = await pool.query('SELECT to_regclass($1) AS table', [name])
  return result.rows[0].table !== null
}

describe('runMigrations', () => {
  it('applies pending migrations in filename order', async () => {
    await addMigration(
      SECOND,
      'CREATE TABLE migrator_test_b (a_id int REFERENCES migrator_test_a (id))',
    )
    await addMigration(
      FIRST,
      'CREATE TABLE migrator_test_a (id int PRIMARY KEY)',
    )

    const applied = await runMigrations(pool, logger, migrationsDir)

    expect(applied).toEqual([FIRST, SECOND])
    expect(await tableExists('migrator_test_b')).toBe(true)
  })

  it('skips migrations that already ran', async () => {
    await addMigration(
      FIRST,
      'CREATE TABLE migrator_test_a (id int PRIMARY KEY)',
    )
    await runMigrations(pool, logger, migrationsDir)

    const appliedAgain = await runMigrations(pool, logger, migrationsDir)

    expect(appliedAgain).toEqual([])
  })

  it('rolls back a failing migration completely', async () => {
    await addMigration(
      BROKEN,
      'CREATE TABLE migrator_test_a (id int); SELECT * FROM table_that_does_not_exist;',
    )

    await expect(runMigrations(pool, logger, migrationsDir)).rejects.toThrow(
      `Migration ${BROKEN} failed`,
    )
    expect(await tableExists('migrator_test_a')).toBe(false)

    const recorded = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE name = $1',
      [BROKEN],
    )
    expect(recorded.rowCount).toBe(0)
  })

  it('ignores files that are not named like migrations', async () => {
    await addMigration('notes.txt', 'not sql')
    await addMigration(
      'create_something.sql',
      'CREATE TABLE should_not_exist (id int)',
    )

    expect(await runMigrations(pool, logger, migrationsDir)).toEqual([])
  })
})
