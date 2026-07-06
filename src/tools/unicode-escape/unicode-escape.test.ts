import { describe, expect, it } from 'vitest'
import { decodeUnicodeEscapes, encodeUnicodeEscapes } from './unicode-escape'

describe('unicode escape utilities', () => {
  it('encodes non-ascii characters as unicode escapes', () => {
    expect(encodeUnicodeEscapes('Hello 你好 😄')).toBe('Hello \\u4F60\\u597D \\uD83D\\uDE04')
  })

  it('can encode every character including ascii', () => {
    expect(encodeUnicodeEscapes('A\n中', { encodeAscii: true })).toBe('\\u0041\\u000A\\u4E2D')
  })

  it('decodes unicode escapes including surrogate pairs', () => {
    expect(decodeUnicodeEscapes('Hello \\u4F60\\u597D \\uD83D\\uDE04')).toEqual({
      ok: true,
      value: 'Hello 你好 😄',
    })
  })

  it('rejects malformed unicode escapes', () => {
    expect(decodeUnicodeEscapes('\\u12Z4')).toEqual({
      ok: false,
      message: '无效的 Unicode 转义：\\u12Z4',
    })
  })
})
