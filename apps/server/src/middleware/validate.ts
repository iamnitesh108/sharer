import type { RequestHandler } from 'express'
import type { z } from 'zod'
import { ValidationError, type ValidationIssue } from '../errors/app-errors.ts'

type RequestPart = 'params' | 'query' | 'body'

export type RequestSchemas = Partial<Record<RequestPart, z.ZodType>>

const PARTS: RequestPart[] = ['params', 'query', 'body']

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const issues: ValidationIssue[] = []
    const parsed = new Map<RequestPart, unknown>()

    for (const part of PARTS) {
      const schema = schemas[part]
      if (!schema) continue

      const result = schema.safeParse(req[part])
      if (result.success) {
        parsed.set(part, result.data)
      } else {
        for (const issue of result.error.issues) {
          issues.push({
            path: [part, ...issue.path.map(String)].join('.'),
            message: issue.message,
          })
        }
      }
    }

    if (issues.length > 0) {
      next(new ValidationError(issues))
      return
    }

    // Express 5 makes req.query a getter, so parsed values are defined on the request itself
    for (const [part, value] of parsed) {
      Object.defineProperty(req, part, {
        value,
        writable: true,
        enumerable: true,
      })
    }

    next()
  }
}
