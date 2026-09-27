import { createApp } from './app.ts'

const DEFAULT_PORT = 3000

const port = readPort(process.env.PORT)
const app = createApp()

app.listen(port, (error) => {
  // Express 5 passes listen errors, such as a port already in use, to this callback
  if (error) {
    console.error(`Could not start the server: ${error.message}`)
    process.exit(1)
  }

  console.log(`Server listening on http://localhost:${port}`)
})

function readPort(value: string | undefined): number {
  if (value === undefined || value === '') {
    return DEFAULT_PORT
  }

  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(
      `PORT must be an integer between 1 and 65535 (got "${value}")`,
    )
    process.exit(1)
  }

  return port
}
