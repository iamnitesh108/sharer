import type { ErrorRequestHandler, Response } from 'express'
import {
  AppError,
  BadRequestError,
  PayloadTooLargeError,
} from '../errors/app-errors.ts'
import type { Logger } from '../lib/logger.ts'

// express.json() marks its failures with a `type` string instead of its own error classes
const BODY_PARSER_ERRORS = new Map<string, () => AppError>([
  [
    'entity.parse.failed',
    () => new BadRequestError('Request body is not valid JSON'),
  ],
  ['entity.too.large', () => new PayloadTooLargeError()],
])

export function toAppError(error: unknown): AppError | undefined {
  if (error instanceof AppError) {
    return error
  }

  if (typeof error === 'object' && error !== null && 'type' in error) {
    return BODY_PARSER_ERRORS.get(String(error.type))?.()
  }

  return undefined
}

function sendError(res: Response, error: AppError) {
  res
    .status(error.statusCode)
    .json({ error: { code: error.code, message: error.message } })
}

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) {
      next(error)
      return
    }

    const appError = toAppError(error)
    if (appError) {
      sendError(res, appError)
      return
    }

    logger.error(
      { err: error, method: req.method, url: req.originalUrl },
      'Unhandled error',
    )
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    })
  }
}
