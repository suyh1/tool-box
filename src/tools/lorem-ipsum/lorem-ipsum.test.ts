import { describe, expect, it } from 'vitest'
import { generateLoremIpsum } from './lorem-ipsum'

describe('lorem ipsum generator utilities', () => {
  it('generates the requested number of paragraphs and sentences', () => {
    const result = generateLoremIpsum({ paragraphs: 2, sentencesPerParagraph: 2, wordsPerSentence: 4 })

    expect(result).toMatchObject({
      ok: true,
      paragraphCount: 2,
      sentenceCount: 4,
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.text.split('\n\n')).toHaveLength(2)
    expect(result.text).toMatch(/^Lorem ipsum/)
  })

  it('returns readable errors for invalid lorem options', () => {
    expect(generateLoremIpsum({ paragraphs: 0 })).toEqual({
      ok: false,
      message: '段落数量必须是 1 到 20 的整数。',
    })
  })
})
