import { createApp } from './app.ts'

const PORT = Number(process.env.PORT ?? 3000)

const app = createApp()

app.listen(PORT, (error) => {
  if (error) {
    throw error
  }

  console.log(`Server running on http://localhost:${PORT}`)
})
