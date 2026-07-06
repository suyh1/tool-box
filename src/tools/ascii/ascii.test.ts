import { describe, expect, it } from 'vitest'
import { analyzeCharacters, getAsciiTable } from './ascii'

describe('ascii utilities', () => {
  it('builds a 128-row ASCII table with control labels', () => {
    const table = getAsciiTable()

    expect(table).toHaveLength(128)
    expect(table[0]).toMatchObject({
      decimal: 0,
      hex: '00',
      binary: '00000000',
      display: 'NUL',
      kind: 'control',
    })
    expect(table[65]).toMatchObject({
      decimal: 65,
      hex: '41',
      binary: '01000001',
      display: 'A',
      kind: 'printable',
    })
  })

  it('analyzes input characters into code point rows', () => {
    expect(analyzeCharacters('A中')).toEqual([
      {
        character: 'A',
        codePoint: 65,
        hex: '0041',
        binary: '01000001',
        htmlEntity: '&#65;',
      },
      {
        character: '中',
        codePoint: 20013,
        hex: '4E2D',
        binary: '100111000101101',
        htmlEntity: '&#20013;',
      },
    ])
  })
})
