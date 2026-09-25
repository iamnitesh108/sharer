import { Router } from 'express'
import { validate } from '../../middleware/validate.ts'
import type { SnippetController } from './snippet.controller.ts'
import {
  createSnippetSchema,
  snippetParamsSchema,
  updateSnippetSchema,
} from './snippet.schemas.ts'

export function createSnippetRouter(controller: SnippetController): Router {
  const router = Router()

  router.post('/', validate({ body: createSnippetSchema }), controller.create)

  router.get(
    '/:slug',
    validate({ params: snippetParamsSchema }),
    controller.getBySlug,
  )

  // PATCH, not PUT: the client sends only the fields it wants to change
  router.patch(
    '/:slug',
    validate({ params: snippetParamsSchema, body: updateSnippetSchema }),
    controller.update,
  )

  return router
}
