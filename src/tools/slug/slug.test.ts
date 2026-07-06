import { describe, expect, it } from 'vitest'
import { generateSlug } from './slug'

describe('generateSlug', () => {
  it('normalizes accents, punctuation, whitespace, and case', () => {
    expect(generateSlug('Crème Brûlée & Vue Tools', {
      separator: '-',
      lowercase: true,
      maxLength: 80,
    })).toBe('creme-brulee-vue-tools')
  })

  it('trims to max length without leaving separators at the edge', () => {
    expect(generateSlug('Alpha Beta Gamma', {
      separator: '-',
      lowercase: true,
      maxLength: 12,
    })).toBe('alpha-beta')
  })
})
