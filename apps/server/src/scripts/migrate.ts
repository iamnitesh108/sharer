import { loadConfig } from '../config/env.ts'
import { runMigrations } from '../db/migrator.ts'
import { createPool } from '../db/pool.ts'
import { createLogger } from '../lib/logger.ts'

// Usage: npm run db:migrate
const config = loadConfig(process.env)
const logger = createLogger(config)
const pool = createPool(config.databaseUrl, logger)

try {
  const applied = await runMigrations(pool, logger)
  logger.info(
    applied.length > 0
      ? `Done, ${applied.length} migration(s) applied`
      : 'Database is already up to date',
  )
} catch (error) {
  logger.error({ err: error }, 'Migration failed')
  process.exitCode = 1
} finally {
  await pool.end()
}
