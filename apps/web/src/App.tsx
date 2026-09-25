import { useEffect, useState } from 'react'
import { getHello } from './api/hello.ts'

function App() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getHello(controller.signal)
      .then((data) => setMessage(data.message))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })

    // Cancel the request if the component unmounts before it finishes
    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>
        <img src="/logo.svg" alt="Sharer" height="40" />
      </h1>
      {error && <p className="error">Could not reach the server: {error}</p>}
      {!error && <p>{message ?? 'Loading...'}</p>}
    </main>
  )
}

export default App
