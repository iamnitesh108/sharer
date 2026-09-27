import { useHello } from './hooks/useHello.ts'

export function App() {
  const { state, retry } = useHello()

  return (
    <main>
      <h1>Sharer</h1>

      <div aria-live="polite">
        {state.status === 'loading' && <p className="muted">Loading…</p>}

        {state.status === 'ready' && <p>{state.message}</p>}

        {state.status === 'error' && (
          <>
            <p className="error">Couldn't reach the server.</p>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </>
        )}
      </div>
    </main>
  )
}
