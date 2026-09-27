import { describe, expect, it } from 'vitest'
import { getHello } from '../../../src/api/hello.ts'
import { stubFetch } from '../../helpers/stub-fetch.ts'

describe('getHello', () => {
  it('returns the greeting from /api/hello', async () => {
    const fetchMock = stubFetch(Response.json({ message: 'Hello' }))

    await expect(getHello()).resolves.toEqual({ message: 'Hello' })
    expect(fetchMock).toHaveBeenCalledWith('/api/hello', { signal: undefined })
  })

  it('throws when the status is not 2xx', async () => {
    stubFetch(new Response('Bad Gateway', { status: 502 }))

    await expect(getHello()).rejects.toThrow(
      'GET /api/hello failed with status 502',
    )
  })

  it('throws when the body has no message', async () => {
    stubFetch(Response.json({ msg: 1 }))

    await expect(getHello()).rejects.toThrow(
      'GET /api/hello returned an unexpected body',
    )
  })
})
