import { describe, expect, it } from 'vitest'
import { generateNanoId } from './nanoid'

function countingBytes(length: number) {
  return Uint8Array.from({ length }, (_, index) => index)
}

describe('nano id utilities', () => {
  it('generates Nano IDs with a custom alphabet', () => {
    expect(generateNanoId({ length: 8, alphabet: 'abc', randomBytes: countingBytes })).toEqual({
      ok: true,
      id: 'abcabcab',
      length: 8,
      alphabetSize: 3,
    })
  })

  it('returns readable errors for invalid Nano ID options', () => {
    expect(generateNanoId({ length: 0 })).toEqual({
      ok: false,
      message: '长度必须是 1 到 256 的整数。',
    })
    expect(generateNanoId({ alphabet: '' })).toEqual({
      ok: false,
      message: '字符集不能为空。',
    })
  })
})
