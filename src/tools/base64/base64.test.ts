import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './base64'

describe('base64 utilities', () => {
  it('encodes unicode text', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=')
    expect(encodeBase64('你好')).toBe('5L2g5aW9')
  })

  it('decodes valid base64', () => {
    expect(decodeBase64('aGVsbG8=')).toEqual({ ok: true, value: 'hello' })
    expect(decodeBase64('5L2g5aW9')).toEqual({ ok: true, value: '你好' })
  })

  it('returns errors for invalid base64', () => {
    expect(decodeBase64('%%%')).toMatchObject({ ok: false })
  })
})
