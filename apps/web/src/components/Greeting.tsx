import { useHello } from '../hooks/useHello.ts'

type GreetingProps = {
  onRetry: () => void
}

export function Greeting({ onRetry }: GreetingProps) {
  const state = useHello()

  return (
    <div aria-live="polite">
      {state.status === 'loading' && <p className="muted">Loading…</p>}

      {state.status === 'ready' && <p>{state.message}</p>}

      {state.status === 'error' && (
        <>
          <p className="error">Couldn't reach the server.</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </>
      )}
    </div>
  )
}
