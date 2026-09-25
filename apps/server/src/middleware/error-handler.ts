import type { ErrorRequestHandler } from 'express'
import {
  AppError,
  BadRequestError,
  PayloadTooLargeError,
  ValidationError,
} from '../errors/app-errors.ts'
import type { Logger } from '../lib/logger.ts'

type ErrorResponseBody = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * The single place where errors become HTTP responses. Must be registered
 * last. Known errors (AppError) are sent to the client as they are; anything
 * else is logged and hidden behind a generic 500, so internal details never
 * leak to the client.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, _req, res, next) => {
    // If the response has already started, Express has to close the connection itself
    if (res.headersSent) {
      next(error)
      return
    }

    const appError = toAppError(error)

    if (!appError) {
      logger.error({ err: error }, 'Unhandled error')
      res.status(500).json(errorBody('INTERNAL_ERROR', 'Something went wrong'))
      return
    }

    const details =
      appError instanceof ValidationError ? appError.details : undefined

    res
      .status(appError.statusCode)
      .json(errorBody(appError.code, appError.message, details))
  }
}

/** Converts known errors to an AppError. Returns null for unexpected errors. */
function toAppError(error: unknown): AppError | null {
  if (error instanceof AppError) {
    return error
  }

  // Errors thrown by express.json() carry a "type" field
  const bodyParserType = getBodyParserErrorType(error)

  if (bodyParserType === 'entity.parse.failed') {
    return new BadRequestError('Request body is not valid JSON')
  }

  if (bodyParserType === 'entity.too.large') {
    return new PayloadTooLargeError()
  }

  return null
}

function getBodyParserErrorType(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'type' in error) {
    return typeof error.type === 'string' ? error.type : undefined
  }
  return undefined
}

function errorBody(
  code: string,
  message: string,
  details?: unknown,
): ErrorResponseBody {
  return details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } }
}
