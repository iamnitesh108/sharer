import { createApp } from './app.ts'
import { ConfigError, loadConfig } from './config/env.ts'
import { checkDatabaseConnection, createPool } from './db/pool.ts'
import { createLogger } from './lib/logger.ts'
import { PostgresSnippetRepository } from './modules/snippets/snippet.repository.ts'
import { SnippetService } from './modules/snippets/snippet.service.ts'
import { generateSlug } from './modules/snippets/snippet.slug.ts'

/**
 * The composition root: the one place where the real implementations are
 * created and connected. Everything else receives its dependencies.
 */
function start() {
  const config = loadConfig(process.env)
  const logger = createLogger(config)
  const pool = createPool(config.databaseUrl, logger)

  const snippetService = new SnippetService(
    new PostgresSnippetRepository(pool),
    generateSlug,
  )

  const app = createApp({
    logger,
    snippetService,
    checkDatabase: () => checkDatabaseConnection(pool),
  })

  const server = app.listen(config.port, (error) => {
    if (error) {
      logger.fatal({ err: error }, 'Server failed to start')
      process.exit(1)
    }

    logger.info(`Server running on http://localhost:${config.port}`)
  })

  // Stop accepting requests, let running ones finish, then close the database
  // connections. SIGTERM comes from Docker and `node --watch`, SIGINT from Ctrl+C.
  async function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down`)
    server.close()
    await pool.end()
    process.exit(0)
  }

  process.once('SIGTERM', () => void shutdown('SIGTERM'))
  process.once('SIGINT', () => void shutdown('SIGINT'))
}

try {
  start()
} catch (error) {
  // The logger may not exist yet (for example when the config is invalid)
  console.error(error instanceof ConfigError ? error.message : error)
  process.exit(1)
}
