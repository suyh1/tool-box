export const passwordCharacterSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()[]{}:;,.?/~_+-=|',
} as const

export type PasswordCharacterSet = keyof typeof passwordCharacterSets

export interface GeneratePasswordOptions {
  length?: number
  includeLowercase?: boolean
  includeUppercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
  avoidAmbiguous?: boolean
  randomBytes?: (length: number) => Uint8Array
}

export type GeneratePasswordResult =
  | {
      ok: true
      password: string
      length: number
      characterSetSize: number
      sets: PasswordCharacterSet[]
      avoidAmbiguous: boolean
    }
  | {
      ok: false
      message: string
    }

const ambiguousCharacters = new Set(['I', 'l', '1', 'O', '0'])

function secureRandomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function maybeRemoveAmbiguous(characters: string, enabled: boolean) {
  if (!enabled) {
    return characters
  }

  return [...characters].filter((character) => !ambiguousCharacters.has(character)).join('')
}

function selectedCharacterSets(options: Required<Omit<GeneratePasswordOptions, 'randomBytes' | 'length'>>) {
  const sets: Array<{ name: PasswordCharacterSet, characters: string }> = []

  if (options.includeLowercase) {
    sets.push({
      name: 'lowercase',
      characters: maybeRemoveAmbiguous(passwordCharacterSets.lowercase, options.avoidAmbiguous),
    })
  }

  if (options.includeUppercase) {
    sets.push({
      name: 'uppercase',
      characters: maybeRemoveAmbiguous(passwordCharacterSets.uppercase, options.avoidAmbiguous),
    })
  }

  if (options.includeNumbers) {
    sets.push({
      name: 'numbers',
      characters: maybeRemoveAmbiguous(passwordCharacterSets.numbers, options.avoidAmbiguous),
    })
  }

  if (options.includeSymbols) {
    sets.push({
      name: 'symbols',
      characters: passwordCharacterSets.symbols,
    })
  }

  return sets
}

function pickCharacter(characters: string, randomByte: number) {
  return characters[randomByte % characters.length]
}

function shuffle(characters: string[], randomBytes: Uint8Array, startOffset: number) {
  let offset = startOffset

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBytes[offset] % (index + 1)
    const current = characters[index]
    characters[index] = characters[swapIndex]
    characters[swapIndex] = current
    offset += 1
  }
}

export function generatePassword(options: GeneratePasswordOptions = {}): GeneratePasswordResult {
  const length = options.length ?? 20

  if (!Number.isInteger(length) || length < 4 || length > 256) {
    return {
      ok: false,
      message: '密码长度必须是 4 到 256 的整数。',
    }
  }

  const normalizedOptions = {
    includeLowercase: options.includeLowercase ?? true,
    includeUppercase: options.includeUppercase ?? true,
    includeNumbers: options.includeNumbers ?? true,
    includeSymbols: options.includeSymbols ?? true,
    avoidAmbiguous: options.avoidAmbiguous ?? false,
  }
  const sets = selectedCharacterSets(normalizedOptions)

  if (sets.length === 0) {
    return {
      ok: false,
      message: '至少选择一种字符集。',
    }
  }

  const randomBytes = options.randomBytes ?? secureRandomBytes
  const entropy = randomBytes(length * 2 + sets.length)
  const combinedCharacters = sets.map((set) => set.characters).join('')
  const passwordCharacters: string[] = []
  let offset = 0

  for (const set of sets) {
    passwordCharacters.push(pickCharacter(set.characters, entropy[offset]))
    offset += 1
  }

  while (passwordCharacters.length < length) {
    passwordCharacters.push(pickCharacter(combinedCharacters, entropy[offset]))
    offset += 1
  }

  shuffle(passwordCharacters, entropy, offset)

  return {
    ok: true,
    password: passwordCharacters.join(''),
    length,
    characterSetSize: combinedCharacters.length,
    sets: sets.map((set) => set.name),
    avoidAmbiguous: normalizedOptions.avoidAmbiguous,
  }
}
