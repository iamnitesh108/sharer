import express from 'express'

export function createApp() {
  const app = express()

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from Sharer' })
  })

  return app
}
