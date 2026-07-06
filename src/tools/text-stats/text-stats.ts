export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  nonEmptyLines: number
  paragraphs: number
  sentences: number
  bytes: number
  uniqueWords: number
  averageWordLength: number
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function analyzeTextStats(input: string): TextStats {
  if (input.length === 0) {
    return {
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
    }
  }

  const lines = input.split(/\r\n|\r|\n/)
  const words = input.match(/[\p{L}\p{N}_]+/gu) ?? []
  const normalizedWords = words.map((word) => word.toLocaleLowerCase())
  const totalWordLength = words.reduce((sum, word) => sum + [...word].length, 0)
  const paragraphCount = input
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length
  const sentenceCount = input.match(/[.!?。！？]+(?=\s|$)/gu)?.length ?? 0

  return {
    characters: [...input].length,
    charactersNoSpaces: [...input.replace(/\s/gu, '')].length,
    words: words.length,
    lines: lines.length,
    nonEmptyLines: lines.filter((line) => line.trim().length > 0).length,
    paragraphs: paragraphCount,
    sentences: sentenceCount,
    bytes: new TextEncoder().encode(input).length,
    uniqueWords: new Set(normalizedWords).size,
    averageWordLength: words.length === 0 ? 0 : round(totalWordLength / words.length),
  }
}
