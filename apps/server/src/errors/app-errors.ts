/**
 * Base class for errors that the API expects and knows how to answer.
 * The error handler turns them into a response with the right status code.
 * Anything that isn't an AppError is treated as a bug and becomes a 500.
 */
export class AppError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
    this.code = code
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export type ValidationIssue = {
  path: string
  message: string
}

export class ValidationError extends AppError {
  readonly details: ValidationIssue[]

  constructor(details: ValidationIssue[]) {
    super('Request validation failed', 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Request body is too large') {
    super(message, 413, 'PAYLOAD_TOO_LARGE')
  }
}
