import { createApp } from './app.ts'
import { parsePort } from './config/port.ts'

const port = portFromEnv()
const app = createApp()

app.listen(port, (error) => {
  // Express 5 passes listen errors, such as a port already in use, to this callback
  if (error) {
    console.error(`Could not start the server: ${error.message}`)
    process.exit(1)
  }

  console.log(`Server listening on http://localhost:${port}`)
})

function portFromEnv(): number {
  try {
    return parsePort(process.env.PORT)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
