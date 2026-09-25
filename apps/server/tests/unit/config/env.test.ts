import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from '../../../src/config/env.ts'

const DATABASE_URL = 'postgres://user:pass@localhost:5432/sharer'

describe('loadConfig', () => {
  it('uses defaults when optional variables are missing', () => {
    const config = loadConfig({ DATABASE_URL })

    expect(config).toEqual({
      env: 'development',
      port: 3000,
      logLevel: 'info',
      databaseUrl: DATABASE_URL,
    })
  })

  it('reads and converts the values it is given', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'warn',
      DATABASE_URL,
    })

    expect(config).toEqual({
      env: 'production',
      port: 8080,
      logLevel: 'warn',
      databaseUrl: DATABASE_URL,
    })
  })

  it('requires DATABASE_URL', () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/)
  })

  it('rejects a DATABASE_URL that is not a postgres URL', () => {
    expect(() =>
      loadConfig({ DATABASE_URL: 'mysql://localhost:3306/sharer' }),
    ).toThrow(/Must be a postgres:\/\/ connection URL/)
  })

  it('throws a ConfigError when PORT is not a number', () => {
    expect(() => loadConfig({ PORT: 'abc', DATABASE_URL })).toThrow(ConfigError)
  })

  it('names every invalid variable in the error message', () => {
    expect(() =>
      loadConfig({ PORT: '99999', NODE_ENV: 'staging', DATABASE_URL }),
    ).toThrow(/PORT[\s\S]*NODE_ENV|NODE_ENV[\s\S]*PORT/)
  })
})
