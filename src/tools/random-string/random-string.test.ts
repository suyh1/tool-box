import { describe, expect, it } from 'vitest'
import { generateRandomString } from './random-string'

function countingBytes(length: number) {
  return Uint8Array.from({ length }, (_, index) => index)
}

describe('random string utilities', () => {
  it('generates strings from the selected preset alphabet', () => {
    const result = generateRandomString({
      length: 16,
      preset: 'hex',
      randomBytes: countingBytes,
    })

    expect(result).toEqual({
      ok: true,
      value: '0123456789abcdef',
      length: 16,
      alphabetSize: 16,
      preset: 'hex',
    })
  })

  it('supports custom alphabets', () => {
    const result = generateRandomString({
      length: 6,
      preset: 'custom',
      customAlphabet: 'ab',
      randomBytes: countingBytes,
    })

    expect(result).toMatchObject({
      ok: true,
      value: 'ababab',
      alphabetSize: 2,
    })
  })

  it('returns readable errors for invalid random string options', () => {
    expect(generateRandomString({ length: 0 })).toEqual({
      ok: false,
      message: '长度必须是 1 到 4096 的整数。',
    })
    expect(generateRandomString({ preset: 'custom', customAlphabet: '' })).toEqual({
      ok: false,
      message: '自定义字符集不能为空。',
    })
  })
})
