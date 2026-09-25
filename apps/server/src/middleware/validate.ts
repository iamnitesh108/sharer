import type { Request, RequestHandler } from 'express'
import type { ZodError, ZodType } from 'zod'
import { ValidationError, type ValidationIssue } from '../errors/app-errors.ts'

type RequestPart = 'body' | 'params' | 'query'

export type RequestSchemas = Partial<Record<RequestPart, ZodType>>

const REQUEST_PARTS: RequestPart[] = ['body', 'params', 'query']

/**
 * Checks the request against the given Zod schemas before it reaches the
 * route handler. On success the parsed values (with defaults and type
 * conversions applied) replace the originals. On failure every problem is
 * collected into a single ValidationError.
 */
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const issues: ValidationIssue[] = []

    for (const part of REQUEST_PARTS) {
      const schema = schemas[part]
      if (!schema) continue

      const result = schema.safeParse(req[part])

      if (result.success) {
        replaceRequestPart(req, part, result.data)
      } else {
        issues.push(...toValidationIssues(part, result.error))
      }
    }

    if (issues.length > 0) {
      next(new ValidationError(issues))
      return
    }

    next()
  }
}

function replaceRequestPart(req: Request, part: RequestPart, value: unknown) {
  // Express 5 makes req.query a read-only getter, so plain assignment doesn't
  // work. Redefining the property works the same way for all three parts.
  Object.defineProperty(req, part, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  })
}

function toValidationIssues(
  part: RequestPart,
  error: ZodError,
): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: [part, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }))
}
