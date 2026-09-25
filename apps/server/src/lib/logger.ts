import { pino, type Logger } from 'pino'
import type { Config } from '../config/env.ts'

export type { Logger }

export function createLogger(config: Config): Logger {
  // Readable, colored logs while developing; plain JSON everywhere else,
  // because log tools in production expect one JSON object per line.
  if (config.env === 'development') {
    return pino({
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          // The request log message already says all of this
          ignore: 'pid,hostname,req,res,responseTime',
        },
      },
    })
  }

  return pino({ level: config.logLevel })
}
