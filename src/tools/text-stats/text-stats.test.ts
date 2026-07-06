import { describe, expect, it } from 'vitest'
import { analyzeTextStats } from './text-stats'

describe('analyzeTextStats', () => {
  it('counts characters, words, lines, paragraphs, and bytes', () => {
    const stats = analyzeTextStats('Hello 世界\n\nOne more line.')

    expect(stats).toEqual({
      characters: 24,
      charactersNoSpaces: 19,
      words: 5,
      lines: 3,
      nonEmptyLines: 2,
      paragraphs: 2,
      sentences: 1,
      bytes: 28,
      uniqueWords: 5,
      averageWordLength: 3.6,
    })
  })

  it('returns zeroed stats for empty text', () => {
    expect(analyzeTextStats('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      nonEmptyLines: 0,
      paragraphs: 0,
      sentences: 0,
      bytes: 0,
      uniqueWords: 0,
      averageWordLength: 0,
    })
  })
})
