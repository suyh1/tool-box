import { describe, expect, it } from 'vitest'
import { decodeHexToText, encodeTextToHex } from './hex'

describe('hex utilities', () => {
  it('encodes text to UTF-8 hex bytes', () => {
    expect(encodeTextToHex('Hello 你好')).toBe('48 65 6c 6c 6f 20 e4 bd a0 e5 a5 bd')
  })

  it('decodes hex bytes to UTF-8 text', () => {
    expect(decodeHexToText('48 65 6c 6c 6f 20 e4bda0 e5a5bd')).toEqual({
      ok: true,
      value: 'Hello 你好',
    })
  })

  it('rejects odd-length hex input', () => {
    expect(decodeHexToText('abc')).toEqual({
      ok: false,
      message: 'Hex 输入必须包含偶数个字符。',
    })
  })

  it('rejects invalid hex characters', () => {
    expect(decodeHexToText('zz')).toEqual({
      ok: false,
      message: 'Hex 输入只能包含 0-9 和 a-f。',
    })
  })
})
