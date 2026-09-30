import { Router } from 'express'

export function createHelloRouter(): Router {
  const router = Router()

  router.get('/hello', (_req, res) => {
    res.json({ message: 'Hello from Sharer' })
  })

  return router
}
