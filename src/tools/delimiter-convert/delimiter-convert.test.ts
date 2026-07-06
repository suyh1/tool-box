import { describe, expect, it } from 'vitest'
import { convertDelimiter } from './delimiter-convert'

describe('convertDelimiter', () => {
  it('converts newline-delimited values to comma-delimited text', () => {
    const result = convertDelimiter('alpha\n beta\n\n gamma', {
      from: 'newline',
      to: 'comma',
      trimItems: true,
      removeEmpty: true,
    })

    expect(result.output).toBe('alpha, beta, gamma')
    expect(result.items).toEqual(['alpha', 'beta', 'gamma'])
    expect(result.stats).toEqual({
      inputItems: 4,
      outputItems: 3,
      removedEmpty: 1,
    })
  })

  it('supports custom source and target delimiters', () => {
    const result = convertDelimiter('a|b|c', {
      from: 'custom',
      to: 'custom',
      customFrom: '|',
      customTo: ' :: ',
      trimItems: true,
      removeEmpty: true,
    })

    expect(result.output).toBe('a :: b :: c')
  })
})
