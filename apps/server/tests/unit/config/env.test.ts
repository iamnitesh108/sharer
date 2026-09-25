import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from '../../../src/config/env.ts'

describe('loadConfig', () => {
  it('uses defaults when optional variables are missing', () => {
    const config = loadConfig({})

    expect(config).toEqual({ env: 'development', port: 3000, logLevel: 'info' })
  })

  it('reads and converts the values it is given', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'warn',
    })

    expect(config).toEqual({ env: 'production', port: 8080, logLevel: 'warn' })
  })

  it('throws a ConfigError when PORT is not a number', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(ConfigError)
  })

  it('names every invalid variable in the error message', () => {
    expect(() => loadConfig({ PORT: '99999', NODE_ENV: 'staging' })).toThrow(
      /PORT[\s\S]*NODE_ENV|NODE_ENV[\s\S]*PORT/,
    )
  })
})
