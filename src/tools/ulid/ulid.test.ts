import { describe, expect, it } from 'vitest'
import { generateUlid, parseUlid } from './ulid'

function zeroBytes(length: number) {
  return new Uint8Array(length)
}

describe('ulid utilities', () => {
  it('generates deterministic ULIDs from timestamp and random bytes', () => {
    expect(generateUlid({ timestampMs: 1, randomBytes: zeroBytes })).toEqual({
      ok: true,
      ulid: '00000000010000000000000000',
      timestampMs: 1,
      dateTime: '1970-01-01T00:00:00.001Z',
    })
  })

  it('parses ULID timestamps', () => {
    expect(parseUlid('00000000010000000000000000')).toEqual({
      ok: true,
      ulid: '00000000010000000000000000',
      timestampMs: 1,
      dateTime: '1970-01-01T00:00:00.001Z',
    })
  })

  it('returns readable errors for invalid ULIDs', () => {
    expect(parseUlid('not-a-ulid')).toEqual({
      ok: false,
      message: 'ULID 必须是 26 位 Crockford Base32 字符。',
    })
  })
})
