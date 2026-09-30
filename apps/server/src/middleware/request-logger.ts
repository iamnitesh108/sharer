import type { RequestHandler } from 'express'
import type { Logger } from '../lib/logger.ts'

// One line per finished request. Headers are never logged because cookies and tokens travel in them.
export function createRequestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const start = performance.now()

    res.on('finish', () => {
      const durationMs = Math.round(performance.now() - start)
      const fields = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      }
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`

      if (res.statusCode >= 500) {
        logger.error(fields, message)
      } else if (res.statusCode >= 400) {
        logger.warn(fields, message)
      } else {
        logger.info(fields, message)
      }
    })

    next()
  }
}
