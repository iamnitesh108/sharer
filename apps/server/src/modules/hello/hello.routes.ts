import { Router } from 'express'

export function createHelloRouter(): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json({ message: 'Hello from Sharer' })
  })

  return router
}
