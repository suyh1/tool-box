import { describe, expect, it } from 'vitest'
import { generatePassword } from './password'

function countingBytes(length: number) {
  return Uint8Array.from({ length }, (_, index) => index)
}

describe('password generator utilities', () => {
  it('generates passwords with the requested length and selected character sets', () => {
    const result = generatePassword({
      length: 24,
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: true,
      includeSymbols: false,
      randomBytes: countingBytes,
    })

    expect(result).toMatchObject({
      ok: true,
      length: 24,
      characterSetSize: 36,
      sets: ['lowercase', 'numbers'],
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.password).toHaveLength(24)
    expect(result.password).toMatch(/^[a-z0-9]+$/)
  })

  it('includes every selected character class when length allows it', () => {
    const result = generatePassword({
      length: 12,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      randomBytes: countingBytes,
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.password).toMatch(/[a-z]/)
    expect(result.password).toMatch(/[A-Z]/)
    expect(result.password).toMatch(/[0-9]/)
    expect(result.password).toMatch(/[!@#$%^&*()[\]{}:;,.?/~_+\-=|]/)
  })

  it('removes ambiguous characters when requested', () => {
    const result = generatePassword({
      length: 64,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false,
      avoidAmbiguous: true,
      randomBytes: countingBytes,
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.password).not.toMatch(/[Il1O0]/)
  })

  it('returns readable errors for invalid options', () => {
    expect(generatePassword({ length: 3 })).toEqual({
      ok: false,
      message: '密码长度必须是 4 到 256 的整数。',
    })
    expect(
      generatePassword({
        length: 16,
        includeLowercase: false,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false,
      }),
    ).toEqual({
      ok: false,
      message: '至少选择一种字符集。',
    })
  })
})
