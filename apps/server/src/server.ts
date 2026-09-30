import { createApp } from './app.ts'
import { loadConfig, type Config } from './config/env.ts'
import { createLogger } from './lib/logger.ts'

const config = configOrExit()
const logger = createLogger(config.logLevel)
const app = createApp({ logger })

app.listen(config.port, (error) => {
  // Express 5 passes listen errors, such as a port already in use, to this callback
  if (error) {
    logger.fatal({ err: error }, 'Could not start the server')
    process.exit(1)
  }

  logger.info(`Server listening on http://localhost:${config.port}`)
})

// Runs before the logger exists, so problems go straight to stderr
function configOrExit(): Config {
  try {
    return loadConfig(process.env)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
