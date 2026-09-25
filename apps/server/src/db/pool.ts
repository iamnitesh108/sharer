import { Pool } from 'pg'
import type { Logger } from '../lib/logger.ts'

export type { Pool }

export function createPool(databaseUrl: string, logger: Logger): Pool {
  const pool = new Pool({ connectionString: databaseUrl })

  // An idle connection can drop, for example when the database restarts.
  // Without this listener, that error would crash the whole process.
  pool.on('error', (error) => {
    logger.error(
      { err: error },
      'Unexpected error on an idle database connection',
    )
  })

  return pool
}

/** Throws if the database can't be reached. Used by the health check. */
export async function checkDatabaseConnection(pool: Pool): Promise<void> {
  await pool.query('SELECT 1')
}
