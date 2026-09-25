import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/App.tsx'

function mockFetch(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('App', () => {
  it('shows a loading message while waiting for the server', () => {
    // A promise that never resolves keeps the request pending
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )

    render(<App />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows the greeting from the server', async () => {
    mockFetch(Response.json({ message: 'Hello from Sharer' }))

    render(<App />)

    expect(await screen.findByText('Hello from Sharer')).toBeInTheDocument()
  })

  it('shows an error when the server responds with an error', async () => {
    mockFetch(new Response(null, { status: 500 }))

    render(<App />)

    expect(
      await screen.findByText(
        'Could not reach the server: Request failed with status 500',
      ),
    ).toBeInTheDocument()
  })
})
