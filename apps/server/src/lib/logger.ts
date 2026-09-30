import { pino, type DestinationStream, type Logger } from 'pino'
import type { LogLevel } from '../config/env.ts'

export type { Logger }

export function createLogger(
  level: LogLevel,
  destination?: DestinationStream,
): Logger {
  return pino({ level }, destination)
}
