export interface GenerateLoremIpsumOptions {
  paragraphs?: number
  sentencesPerParagraph?: number
  wordsPerSentence?: number
}

export type GenerateLoremIpsumResult =
  | {
      ok: true
      text: string
      paragraphCount: number
      sentenceCount: number
      wordCount: number
    }
  | {
      ok: false
      message: string
    }

const loremWords = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
]

function sentenceAt(start: number, wordsPerSentence: number) {
  const words = Array.from({ length: wordsPerSentence }, (_, index) => loremWords[(start + index) % loremWords.length])
  const sentence = words.join(' ')
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`
}

export function generateLoremIpsum(options: GenerateLoremIpsumOptions = {}): GenerateLoremIpsumResult {
  const paragraphs = options.paragraphs ?? 3
  const sentencesPerParagraph = options.sentencesPerParagraph ?? 4
  const wordsPerSentence = options.wordsPerSentence ?? 12

  if (!Number.isInteger(paragraphs) || paragraphs < 1 || paragraphs > 20) {
    return {
      ok: false,
      message: '段落数量必须是 1 到 20 的整数。',
    }
  }

  if (!Number.isInteger(sentencesPerParagraph) || sentencesPerParagraph < 1 || sentencesPerParagraph > 12) {
    return {
      ok: false,
      message: '每段句数必须是 1 到 12 的整数。',
    }
  }

  if (!Number.isInteger(wordsPerSentence) || wordsPerSentence < 3 || wordsPerSentence > 40) {
    return {
      ok: false,
      message: '每句词数必须是 3 到 40 的整数。',
    }
  }

  const text = Array.from({ length: paragraphs }, (_, paragraphIndex) => {
    return Array.from({ length: sentencesPerParagraph }, (_, sentenceIndex) => {
      const start = (paragraphIndex * sentencesPerParagraph + sentenceIndex) * wordsPerSentence
      return sentenceAt(start, wordsPerSentence)
    }).join(' ')
  }).join('\n\n')

  return {
    ok: true,
    text,
    paragraphCount: paragraphs,
    sentenceCount: paragraphs * sentencesPerParagraph,
    wordCount: paragraphs * sentencesPerParagraph * wordsPerSentence,
  }
}
