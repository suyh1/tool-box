export type ListRandomMode = 'shuffle' | 'sample'

export interface ListRandomOptions {
  mode: ListRandomMode
  sampleSize: number
  seed?: string
  trimItems: boolean
  removeEmpty: boolean
}

export interface ListRandomResult {
  output: string
  items: string[]
  stats: {
    inputItems: number
    outputItems: number
    removedEmpty: number
  }
}

function hashSeed(seed: string) {
  let hash = 2166136261

  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function randomFromSeed(seed?: string) {
  if (!seed) {
    return Math.random
  }

  let state = hashSeed(seed)

  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = current
  }

  return result
}

export function randomizeList(input: string, options: ListRandomOptions): ListRandomResult {
  const rawItems = input.length === 0 ? [] : input.split(/\r\n|\r|\n/)
  const cleanedItems = options.trimItems ? rawItems.map((item) => item.trim()) : [...rawItems]
  const items = options.removeEmpty ? cleanedItems.filter((item) => item.length > 0) : cleanedItems
  const randomized = shuffle(items, randomFromSeed(options.seed))
  const outputItems = options.mode === 'sample'
    ? randomized.slice(0, Math.max(0, Math.min(options.sampleSize, randomized.length)))
    : randomized

  return {
    output: outputItems.join('\n'),
    items: outputItems,
    stats: {
      inputItems: rawItems.length,
      outputItems: outputItems.length,
      removedEmpty: cleanedItems.length - items.length,
    },
  }
}
