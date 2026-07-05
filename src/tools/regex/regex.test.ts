import { describe, expect, it } from 'vitest'
import { testRegex } from './regex'

describe('regex utilities', () => {
  it('finds global matches with indexes', () => {
    expect(testRegex('\\d+', 'g', 'a12 b345')).toEqual({
      ok: true,
      matches: [
        { value: '12', index: 1, groups: [], namedGroups: {} },
        { value: '345', index: 5, groups: [], namedGroups: {} },
      ],
    })
  })

  it('captures numbered and named groups', () => {
    expect(testRegex('(?<name>[a-z]+):(\\d+)', 'g', 'port:443')).toEqual({
      ok: true,
      matches: [
        {
          value: 'port:443',
          index: 0,
          groups: ['port', '443'],
          namedGroups: { name: 'port' },
        },
      ],
    })
  })

  it('returns errors for invalid patterns', () => {
    expect(testRegex('[', 'g', 'text')).toMatchObject({ ok: false })
  })

  it('returns errors for duplicate flags', () => {
    expect(testRegex('a', 'gg', 'aaa')).toMatchObject({ ok: false })
  })
})
