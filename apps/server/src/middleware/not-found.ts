import type { RequestHandler } from 'express'
import { NotFoundError } from '../errors/app-errors.ts'

/** Runs when no route matched the request. Must be registered after all routes. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`))
}
