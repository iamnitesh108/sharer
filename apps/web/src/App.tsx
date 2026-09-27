import { useHello } from './hooks/useHello.ts'

export function App() {
  const { state, retry } = useHello()

  return (
    <main>
      <h1>
        <picture>
          <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo.svg" alt="Sharer" width="133" height="40" />
        </picture>
      </h1>

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
