import { vi } from 'vitest'

// Each call to fetch gets the next response in order, or rejects with the next error
export function stubFetch(...results: Array<Response | Error>) {
  const fetchMock = vi.fn<typeof fetch>()

  for (const result of results) {
    if (result instanceof Error) {
      fetchMock.mockRejectedValueOnce(result)
    } else {
      fetchMock.mockResolvedValueOnce(result)
    }
  }

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
