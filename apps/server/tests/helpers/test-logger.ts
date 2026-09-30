import { createLogger, type Logger } from '../../src/lib/logger.ts'

export type LogLine = Record<string, unknown> & { level: number; msg: string }

// A real pino logger that writes into an array, so tests can read what was logged
export function createTestLogger(): { logger: Logger; lines: () => LogLine[] } {
  const output: string[] = []
  const logger = createLogger('trace', {
    write: (line: string) => {
      output.push(line)
    },
  })

  return {
    logger,
    lines: () => output.map((line) => JSON.parse(line) as LogLine),
  }
}
