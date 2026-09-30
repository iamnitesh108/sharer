import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from '../../../src/config/env.ts'

function problemsOf(env: Record<string, string>): string[] {
  try {
    loadConfig(env)
  } catch (error) {
    if (error instanceof ConfigError) return error.problems
    throw error
  }
  return []
}

describe('loadConfig', () => {
  it('uses the defaults when nothing is set', () => {
    expect(loadConfig({})).toEqual({ port: 3000, logLevel: 'info' })
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
      expect(problemsOf({ PORT })).toEqual([
        expect.stringMatching(/^PORT: must be an integer between 1 and 65535/),
      ])
    },
  )

  it('reads LOG_LEVEL', () => {
    expect(loadConfig({ LOG_LEVEL: 'debug' }).logLevel).toBe('debug')
  })

  it('reports every invalid variable at once', () => {
    expect(problemsOf({ PORT: 'abc', LOG_LEVEL: 'loud' })).toEqual([
      'PORT: must be an integer between 1 and 65535 (got "abc")',
      'LOG_LEVEL: must be one of fatal, error, warn, info, debug, trace, silent',
    ])
  })

  it('puts every problem in the error message', () => {
    expect(() => loadConfig({ PORT: 'abc', LOG_LEVEL: 'loud' })).toThrow(
      'Invalid configuration:\n  - PORT: must be an integer between 1 and 65535 (got "abc")\n  - LOG_LEVEL:',
    )
  })
})
