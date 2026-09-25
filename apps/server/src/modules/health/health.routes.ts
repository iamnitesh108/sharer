import { Router } from 'express'

/**
 * Health check used by Docker, load balancers and uptime monitors.
 * Responds with 503 when the database can't be reached, so a broken
 * instance can be taken out of service.
 */
export function createHealthRouter(checkDatabase: () => Promise<void>): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    try {
      await checkDatabase()
      res.json({ status: 'ok', database: 'up' })
    } catch {
      res.status(503).json({ status: 'error', database: 'down' })
    }
  })

  return router
}
