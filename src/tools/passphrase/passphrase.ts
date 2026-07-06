export const defaultPassphraseWords = [
  'anchor',
  'breeze',
  'copper',
  'delta',
  'ember',
  'forest',
  'galaxy',
  'harbor',
  'island',
  'jungle',
  'kitten',
  'lantern',
  'meadow',
  'nebula',
  'orange',
  'prairie',
  'quartz',
  'rocket',
  'silver',
  'tundra',
  'umbra',
  'velvet',
  'willow',
  'xenon',
  'yellow',
  'zenith',
] as const

export interface GeneratePassphraseOptions {
  wordCount?: number
  separator?: string
  capitalize?: boolean
  includeNumber?: boolean
  wordList?: readonly string[]
  randomBytes?: (length: number) => Uint8Array
}

export type GeneratePassphraseResult =
  | {
      ok: true
      passphrase: string
      wordCount: number
      separator: string
      wordListSize: number
    }
  | {
      ok: false
      message: string
    }

function secureRandomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function generatePassphrase(options: GeneratePassphraseOptions = {}): GeneratePassphraseResult {
  const wordCount = options.wordCount ?? 4
  const separator = options.separator ?? '-'
  const wordList = options.wordList ?? defaultPassphraseWords

  if (!Number.isInteger(wordCount) || wordCount < 3 || wordCount > 12) {
    return {
      ok: false,
      message: '词数必须是 3 到 12 的整数。',
    }
  }

  if (separator.length > 4) {
    return {
      ok: false,
      message: '分隔符最多 4 个字符。',
    }
  }

  if (wordList.length === 0) {
    return {
      ok: false,
      message: '词表不能为空。',
    }
  }

  const randomBytes = options.randomBytes ?? secureRandomBytes
  const entropy = randomBytes(wordCount + (options.includeNumber ? 1 : 0))
  const words = Array.from({ length: wordCount }, (_, index) => {
    const word = wordList[entropy[index] % wordList.length]
    return options.capitalize ? capitalizeWord(word) : word
  })

  if (options.includeNumber) {
    words.push(String(entropy[wordCount] % 10))
  }

  return {
    ok: true,
    passphrase: words.join(separator),
    wordCount,
    separator,
    wordListSize: wordList.length,
  }
}
