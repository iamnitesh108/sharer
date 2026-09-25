import type { Request, Response } from 'express'
import type { SnippetService } from './snippet.service.ts'
import type {
  CreateSnippetInput,
  Snippet,
  UpdateSnippetInput,
} from './snippet.types.ts'

/** What the API returns for a snippet. The internal id is never exposed. */
export type SnippetResponse = {
  slug: string
  content: string
  language: string
  createdAt: string
  updatedAt: string
}

/**
 * Translates between HTTP and the service. Request bodies and params have
 * already been checked by the validate middleware in snippet.routes.ts.
 */
export class SnippetController {
  private readonly service: SnippetService

  constructor(service: SnippetService) {
    this.service = service
  }

  // Arrow functions keep `this` bound when Express calls them as route handlers
  create = async (req: Request, res: Response) => {
    const input = req.body as CreateSnippetInput
    const snippet = await this.service.createSnippet(input)
    res.status(201).json(toSnippetResponse(snippet))
  }

  getBySlug = async (req: Request<{ slug: string }>, res: Response) => {
    const snippet = await this.service.getSnippet(req.params.slug)
    res.json(toSnippetResponse(snippet))
  }

  update = async (req: Request<{ slug: string }>, res: Response) => {
    const changes = req.body as UpdateSnippetInput
    const snippet = await this.service.updateSnippet(req.params.slug, changes)
    res.json(toSnippetResponse(snippet))
  }
}

function toSnippetResponse(snippet: Snippet): SnippetResponse {
  return {
    slug: snippet.slug,
    content: snippet.content,
    language: snippet.language,
    createdAt: snippet.createdAt.toISOString(),
    updatedAt: snippet.updatedAt.toISOString(),
  }
}
