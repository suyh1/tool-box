import { describe, expect, it } from 'vitest'
import { randomizeList } from './list-random'

describe('randomizeList', () => {
  it('shuffles a cleaned list deterministically when a seed is provided', () => {
    const result = randomizeList('alpha\n beta\n\ngamma\ndelta', {
      mode: 'shuffle',
      sampleSize: 2,
      seed: 'toolbox',
      trimItems: true,
      removeEmpty: true,
    })

    expect(result.output).toBe('delta\ngamma\nalpha\nbeta')
    expect(result.stats).toEqual({
      inputItems: 5,
      outputItems: 4,
      removedEmpty: 1,
    })
  })

  it('samples the requested number of items after shuffling', () => {
    const result = randomizeList('alpha\nbeta\ngamma\ndelta', {
      mode: 'sample',
      sampleSize: 2,
      seed: 'toolbox',
      trimItems: true,
      removeEmpty: true,
    })

    expect(result.output).toBe('delta\ngamma')
    expect(result.stats.outputItems).toBe(2)
  })
})
