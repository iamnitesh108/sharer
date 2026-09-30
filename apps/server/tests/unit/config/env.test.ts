import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from '../../../src/config/env.ts'

describe('loadConfig', () => {
  it('uses the defaults when nothing is set', () => {
    expect(loadConfig({})).toEqual({ port: 3000 })
  })

  it.each([
    { PORT: '1', port: 1 },
    { PORT: '3100', port: 3100 },
    { PORT: '65535', port: 65535 },
  ])('reads PORT=$PORT', ({ PORT, port }) => {
    expect(loadConfig({ PORT }).port).toBe(port)
  })

  it.each(['', 'abc', '0', '65536', '3000.5', '-1', '1e3', ' 80'])(
    'rejects PORT=%j',
    (PORT) => {
      expect(() => loadConfig({ PORT })).toThrow(ConfigError)
      expect(() => loadConfig({ PORT })).toThrow(
        /PORT: must be an integer between 1 and 65535/,
      )
    },
  )
})
