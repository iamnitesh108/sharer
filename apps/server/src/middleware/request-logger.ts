import type { Request, RequestHandler, Response } from 'express'
import { pinoHttp } from 'pino-http'
import type { Logger } from '../lib/logger.ts'

/**
 * Logs one line per request, for example "GET /api/health 200 (3ms)".
 * Headers are left out on purpose: they are noisy and will contain session
 * cookies once authentication exists.
 */
export function createRequestLogger(logger: Logger): RequestHandler {
  return pinoHttp<Request, Response>({
    logger,
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      return 'info'
    },
    // originalUrl, because routers rewrite req.url to the part after their mount path
    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${req.originalUrl} ${res.statusCode} (${responseTime}ms)`,
    customErrorMessage: (req, res) =>
      `${req.method} ${req.originalUrl} ${res.statusCode} failed`,
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
}
