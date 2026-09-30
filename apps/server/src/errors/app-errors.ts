export type ValidationIssue = {
  path: string
  message: string
}

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: ValidationIssue[]

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ValidationIssue[],
  ) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, 'BAD_REQUEST', message)
  }
}

export class ValidationError extends AppError {
  constructor(details: ValidationIssue[]) {
    super(400, 'VALIDATION_ERROR', 'Request is invalid', details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message)
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Request body is too large') {
    super(413, 'PAYLOAD_TOO_LARGE', message)
  }
}
