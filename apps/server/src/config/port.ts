const DEFAULT_PORT = 3000
const MAX_PORT = 65535

export function parsePort(value: string | undefined): number {
  if (value === undefined || value === '') {
    return DEFAULT_PORT
  }

  const port = Number(value)
  if (!/^\d+$/.test(value) || port < 1 || port > MAX_PORT) {
    throw new Error(
      `PORT must be an integer between 1 and ${MAX_PORT} (got "${value}")`,
    )
  }

  return port
}
