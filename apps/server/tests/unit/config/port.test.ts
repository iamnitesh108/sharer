import { describe, expect, it } from 'vitest'
import { parsePort } from '../../../src/config/port.ts'

describe('parsePort', () => {
  it.each([
    { value: undefined, expected: 3000 },
    { value: '', expected: 3000 },
    { value: '1', expected: 1 },
    { value: '3100', expected: 3100 },
    { value: '65535', expected: 65535 },
  ])('reads $value as $expected', ({ value, expected }) => {
    expect(parsePort(value)).toBe(expected)
  })

  it.each(['abc', '0', '65536', '3000.5', '-1', '1e3', ' 80'])(
    'rejects %j',
    (value) => {
      expect(() => parsePort(value)).toThrow(
        `PORT must be an integer between 1 and 65535 (got "${value}")`,
      )
    },
  )
})
