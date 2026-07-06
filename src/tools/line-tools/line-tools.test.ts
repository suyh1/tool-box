import { describe, expect, it } from 'vitest'
import { processLines } from './line-tools'

describe('processLines', () => {
  it('trims, removes empty rows, sorts, and deduplicates lines', () => {
    const result = processLines(' beta\nalpha\n\nbeta \ngamma', {
      trimLines: true,
      removeEmpty: true,
      sort: 'asc',
      unique: true,
      caseSensitive: true,
    })

    expect(result.output).toBe('alpha\nbeta\ngamma')
    expect(result.stats).toEqual({
      inputLines: 5,
      outputLines: 3,
      removedEmpty: 1,
      removedDuplicates: 1,
    })
  })

  it('supports case-insensitive dedupe while preserving first spelling', () => {
    const result = processLines('Beta\nalpha\nbeta', {
      trimLines: false,
      removeEmpty: false,
      sort: 'none',
      unique: true,
      caseSensitive: false,
    })

    expect(result.output).toBe('Beta\nalpha')
    expect(result.stats.removedDuplicates).toBe(1)
  })
})
