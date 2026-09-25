import { Router } from 'express'

/**
 * Health check used by Docker, load balancers and uptime monitors to see
 * whether the server is running. Later it will also check the database.
 */
export function createHealthRouter(): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return router
}
