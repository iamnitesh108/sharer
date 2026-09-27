import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App.tsx'
import { stubFetch } from '../helpers/stub-fetch.ts'

describe('App', () => {
  it('shows loading, then the greeting from the API', async () => {
    stubFetch(Response.json({ message: 'Hello from Sharer' }))

    render(<App />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByText('Hello from Sharer')).toBeInTheDocument()
  })

  it('shows an error and a Retry button when the request fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    stubFetch(new TypeError('Failed to fetch'))

    render(<App />)

    expect(
      await screen.findByText("Couldn't reach the server."),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalled()
  })

  it('requests the greeting again when Retry is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = stubFetch(
      new Response('Bad Gateway', { status: 502 }),
      Response.json({ message: 'Hello from Sharer' }),
    )
    const user = userEvent.setup()

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Hello from Sharer')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
