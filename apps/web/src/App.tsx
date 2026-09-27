import { useState } from 'react'
import { Greeting } from './components/Greeting.tsx'

export function App() {
  const [attempt, setAttempt] = useState(0)

  return (
    <main>
      <h1>
        <picture>
          <source
            srcSet="/logo-dark.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img src="/logo.svg" alt="Sharer" width="133" height="40" />
        </picture>
      </h1>

      {/* A new key mounts a fresh Greeting, which starts a new request */}
      <Greeting
        key={attempt}
        onRetry={() => setAttempt((count) => count + 1)}
      />
    </main>
  )
}
