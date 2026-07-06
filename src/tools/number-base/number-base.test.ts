import { describe, expect, it } from 'vitest'
import { convertNumberBase, getNumberBaseSummary } from './number-base'

describe('number base utilities', () => {
  it('converts hexadecimal numbers to decimal', () => {
    expect(convertNumberBase('ff', 16, 10)).toEqual({
      ok: true,
      value: '255',
    })
  })

  it('converts decimal numbers to binary', () => {
    expect(convertNumberBase('42', 10, 2)).toEqual({
      ok: true,
      value: '101010',
    })
  })

  it('returns common base summary values', () => {
    expect(getNumberBaseSummary('255', 10)).toEqual({
      ok: true,
      values: {
        binary: '11111111',
        octal: '377',
        decimal: '255',
        hexadecimal: 'ff',
      },
    })
  })

  it('supports values larger than Number.MAX_SAFE_INTEGER', () => {
    expect(convertNumberBase('ffffffffffffffff', 16, 10)).toEqual({
      ok: true,
      value: '18446744073709551615',
    })
  })

  it('rejects invalid digits for the source base', () => {
    expect(convertNumberBase('102', 2, 10)).toEqual({
      ok: false,
      message: '输入包含不属于 2 进制的字符：2',
    })
  })
})
