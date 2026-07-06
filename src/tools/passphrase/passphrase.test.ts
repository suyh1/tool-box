import { describe, expect, it } from 'vitest'
import { generatePassphrase } from './passphrase'

function countingBytes(length: number) {
  return Uint8Array.from({ length }, (_, index) => index)
}

describe('passphrase generator utilities', () => {
  it('generates deterministic word-list passphrases from an injected random source', () => {
    const result = generatePassphrase({
      wordCount: 4,
      separator: '-',
      wordList: ['alpha', 'bravo', 'charlie', 'delta'],
      randomBytes: countingBytes,
    })

    expect(result).toEqual({
      ok: true,
      passphrase: 'alpha-bravo-charlie-delta',
      wordCount: 4,
      separator: '-',
      wordListSize: 4,
    })
  })

  it('can capitalize words and append a numeric suffix', () => {
    const result = generatePassphrase({
      wordCount: 3,
      separator: ' ',
      capitalize: true,
      includeNumber: true,
      wordList: ['alpha', 'bravo', 'charlie'],
      randomBytes: countingBytes,
    })

    expect(result).toMatchObject({
      ok: true,
      passphrase: 'Alpha Bravo Charlie 3',
    })
  })

  it('returns readable errors for invalid passphrase options', () => {
    expect(generatePassphrase({ wordCount: 2 })).toEqual({
      ok: false,
      message: '词数必须是 3 到 12 的整数。',
    })
  })
})
