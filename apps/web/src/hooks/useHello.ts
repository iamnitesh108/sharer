import { useEffect, useState } from 'react'
import { getHello } from '../api/hello.ts'

export type HelloState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error' }

export function useHello(): HelloState {
  const [state, setState] = useState<HelloState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    getHello(controller.signal)
      .then((hello) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', message: hello.message })
        }
      })
      .catch((error: unknown) => {
        // A cancelled request (unmount or StrictMode's second run) must not update state
        if (controller.signal.aborted) return

        console.error(error)
        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [])

  return state
}
