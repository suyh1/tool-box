import { describe, expect, it } from 'vitest'
import { decodeUrlComponent, encodeUrlComponent } from './url'

describe('url utilities', () => {
  it('encodes URL components', () => {
    expect(encodeUrlComponent('a b+c')).toBe('a%20b%2Bc')
  })

  it('decodes URL components', () => {
    expect(decodeUrlComponent('a%20b%2Bc')).toEqual({ ok: true, value: 'a b+c' })
  })

  it('returns errors for malformed sequences', () => {
    expect(decodeUrlComponent('%E0%A4%A')).toMatchObject({ ok: false })
  })
})
