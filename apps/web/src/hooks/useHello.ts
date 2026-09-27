import { useEffect, useState } from 'react'
import { getHello } from '../api/hello.ts'

export type HelloState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error' }

export function useHello(): { state: HelloState; retry: () => void } {
  const [state, setState] = useState<HelloState>({ status: 'loading' })
  // retry() bumps this to run the effect again
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getHello(controller.signal)
      .then((hello) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', message: hello.message })
        }
      })
      .catch((error: unknown) => {
        // A cancelled request (unmount, retry, StrictMode's second run) must not update state
        if (controller.signal.aborted) return

        console.error(error)
        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }

  return { state, retry }
}
