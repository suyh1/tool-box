import { describe, expect, it } from 'vitest'
import { dateToUnix, unixToIso } from './timestamp'

describe('timestamp utilities', () => {
  it('converts Unix seconds to ISO strings', () => {
    expect(unixToIso('0', 'seconds')).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:00.000Z',
      milliseconds: 0,
      seconds: 0,
    })
  })

  it('converts Unix milliseconds to ISO strings', () => {
    expect(unixToIso('1000', 'milliseconds')).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:01.000Z',
      milliseconds: 1000,
      seconds: 1,
    })
  })

  it('converts ISO strings to Unix seconds and milliseconds', () => {
    expect(dateToUnix('1970-01-01T00:00:01.000Z')).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:01.000Z',
      milliseconds: 1000,
      seconds: 1,
    })
  })

  it('returns errors for invalid date input', () => {
    expect(dateToUnix('not a date')).toMatchObject({ ok: false })
    expect(unixToIso('abc', 'seconds')).toMatchObject({ ok: false })
  })
})
