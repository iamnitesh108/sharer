import { createApp } from './app.ts'
import { ConfigError, loadConfig } from './config/env.ts'
import { createLogger } from './lib/logger.ts'

function start() {
  const config = loadConfig(process.env)
  const logger = createLogger(config)
  const app = createApp({ logger })

  app.listen(config.port, (error) => {
    if (error) {
      logger.fatal({ err: error }, 'Server failed to start')
      process.exit(1)
    }

    logger.info(`Server running on http://localhost:${config.port}`)
  })
}

try {
  start()
} catch (error) {
  // The logger may not exist yet (for example when the config is invalid)
  console.error(error instanceof ConfigError ? error.message : error)
  process.exit(1)
}
