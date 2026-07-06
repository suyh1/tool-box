import { describe, expect, it } from 'vitest'
import { decodeBinaryToText, encodeTextToBinary } from './binary'

describe('binary utilities', () => {
  it('encodes text to UTF-8 binary bytes', () => {
    expect(encodeTextToBinary('A中')).toBe('01000001 11100100 10111000 10101101')
  })

  it('decodes binary bytes to UTF-8 text', () => {
    expect(decodeBinaryToText('01000001 11100100 10111000 10101101')).toEqual({
      ok: true,
      value: 'A中',
    })
  })

  it('rejects binary input that is not grouped into bytes', () => {
    expect(decodeBinaryToText('010')).toEqual({
      ok: false,
      message: 'Binary 输入必须按 8 位字节分组。',
    })
  })

  it('rejects non-binary characters', () => {
    expect(decodeBinaryToText('0100000x')).toEqual({
      ok: false,
      message: 'Binary 输入只能包含 0 和 1。',
    })
  })
})
