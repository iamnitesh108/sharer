import { createApp } from './app.ts'
import { loadConfig, type Config } from './config/env.ts'

const config = configOrExit()
const app = createApp()

app.listen(config.port, (error) => {
  // Express 5 passes listen errors, such as a port already in use, to this callback
  if (error) {
    console.error(`Could not start the server: ${error.message}`)
    process.exit(1)
  }

  console.log(`Server listening on http://localhost:${config.port}`)
})

function configOrExit(): Config {
  try {
    return loadConfig(process.env)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
